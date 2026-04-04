import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DhikrSession } from "@/context/AppContext";
import {
  completionDayKeysSorted,
  getWeeklyCompletionLog,
  isTimestampInLocalCalendarWeek,
  localDayKey,
  longestStreakFromSortedDayKeys,
  streakEndingOn,
  type CalendarWeekDaySlot,
} from "@/lib/dailyCompletion";

const STORAGE_KEY = "@dhikr_insights_local_v1";
const MAX_EACH = 400;
/** One-time migration: see `migrateLegacyFakeOnboardingCloseness`. */
const LEGACY_ONBOARDING_CLOSENESS_MIGRATION_FLAG_KEY =
  "@dhikr_insights_migrated_legacy_onboarding_closeness_v1";

/**
 * Legacy onboarding (pre-fix) sometimes wrote default closeness with mood even though the UI did not
 * collect closeness. Those rows are not tagged in storage and look identical to guided ritual rows.
 *
 * **Current behavior:** The onboarding dhikr demo does **not** call `recordDhikrCompleted` or
 * `recordSessionWellbeing` — demo practice is excluded from Insights entirely. Streak (here and in
 * app state) uses `completeSession` / session history only — full dhikr or dua completions, not
 * ritual opens or partial taps.
 *
 * **Legacy migration signal:** Older builds called `recordDhikrCompleted` immediately before
 * `recordSessionWellbeing` and never `recordRitualSessionStarted`. Guided flows call
 * `recordRitualSessionStarted` before wellbeing, so a wellbeing row with paired dhikr timing but **no**
 * `ritualStarts` at or before that row’s `at` is almost certainly legacy onboarding (or the same pattern
 * without a ritual start). We only strip closeness in that case so dua completions and guided sessions
 * stay intact.
 *
 * **Not reliably fixable:** If the user had any `ritualStarts` entry before the onboarding write (e.g.
 * direct ritual or guided earlier), we keep closeness — better a leftover fake than deleting a real score.
 */

/**
 * Canonical wellbeing row under `wellbeing`. `closeness` is omitted when only mood was collected
 * (onboarding mood step); guided ritual always writes both.
 */
export type StoredWellbeingEntry = { at: string; mood: number; closeness?: number };

type Stored = {
  ritualStarts: string[];
  dhikrCompletions: string[];
  duaStarts: string[];
  wellbeing: StoredWellbeingEntry[];
};

export function isWellbeingScore(n: unknown): n is number {
  // 1–10 inclusive; 5 is a valid mid-scale score and must never be treated as a sentinel.
  return typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 10;
}

/**
 * Legacy reads: map `feeling` / `closeToGod` onto the canonical shape. Rows may be mood-only if
 * closeness was never stored. New writes use `recordSessionWellbeing` (mood required; closeness optional).
 */
export function normalizeWellbeingEntry(raw: unknown): StoredWellbeingEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const at = typeof o.at === "string" ? o.at : null;
  if (!at) return null;
  const moodRaw = o.mood ?? o.feeling;
  const closenessRaw = o.closeness ?? o.closeToGod;
  const mood = typeof moodRaw === "number" ? moodRaw : Number(moodRaw);
  const closenessParsed =
    closenessRaw === undefined || closenessRaw === null
      ? undefined
      : typeof closenessRaw === "number"
        ? closenessRaw
        : Number(closenessRaw);
  if (!isWellbeingScore(mood)) return null;
  if (closenessParsed !== undefined && isWellbeingScore(closenessParsed)) {
    return { at, mood, closeness: closenessParsed };
  }
  return { at, mood };
}

export function averageWellbeingScores(values: number[]): string {
  const scores = values.filter(isWellbeingScore);
  if (scores.length === 0) return "–";
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

const emptyStored = (): Stored => ({
  ritualStarts: [],
  dhikrCompletions: [],
  duaStarts: [],
  wellbeing: [],
});

function parseIsoMs(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : NaN;
}

/** Sorted ascending unique finite ms values from ISO timestamp lists. */
function sortedFiniteMsFromIsoList(list: string[]): number[] {
  const xs = list.map(parseIsoMs).filter(Number.isFinite);
  xs.sort((a, b) => a - b);
  return xs;
}

/** Latest dhikr completion at or before `wMs` within `maxDeltaMs` (onboarding + guided dhikr path). */
function latestDhikrCompletionPairedMs(wMs: number, dhikrMsSorted: number[], maxDeltaMs: number): boolean {
  let lo = 0;
  let hi = dhikrMsSorted.length - 1;
  let best = -Infinity;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = dhikrMsSorted[mid];
    if (v <= wMs) {
      best = v;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return Number.isFinite(best) && wMs - best >= 0 && wMs - best <= maxDeltaMs;
}

/** Any ritual start at or before wellbeing time (guided intercept precedes completion). */
function hasRitualStartAtOrBefore(wMs: number, ritualMsSorted: number[]): boolean {
  if (ritualMsSorted.length === 0) return false;
  let lo = 0;
  let hi = ritualMsSorted.length - 1;
  let ans = -Infinity;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = ritualMsSorted[mid];
    if (v <= wMs) {
      ans = v;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return Number.isFinite(ans);
}

type LegacyClosenessMigrationResult = {
  inspectedWithCloseness: number;
  strippedCloseness: number;
  storageUpdated: boolean;
};

/**
 * Strips closeness only when a row matches legacy onboarding’s dhikr-demo pattern and cannot be a
 * normal guided dhikr completion (no prior ritual start in storage). Idempotent on stored shape.
 */
function migrateLegacyFakeOnboardingCloseness(
  parsed: Record<string, unknown>,
  ritualStarts: string[],
  dhikrCompletions: string[],
): LegacyClosenessMigrationResult {
  const rawWellbeing = Array.isArray(parsed.wellbeing) ? parsed.wellbeing : [];
  const ritualMs = sortedFiniteMsFromIsoList(ritualStarts);
  const dhikrMs = sortedFiniteMsFromIsoList(dhikrCompletions);
  const DHIKR_PAIR_MAX_MS = 12_000;

  let inspectedWithCloseness = 0;
  let strippedCloseness = 0;
  const nextRaw: unknown[] = [];

  for (const raw of rawWellbeing) {
    const w = normalizeWellbeingEntry(raw);
    if (!w) {
      nextRaw.push(raw);
      continue;
    }
    if (w.closeness === undefined) {
      nextRaw.push(raw);
      continue;
    }
    inspectedWithCloseness += 1;
    const wMs = parseIsoMs(w.at);
    if (
      Number.isFinite(wMs) &&
      latestDhikrCompletionPairedMs(wMs, dhikrMs, DHIKR_PAIR_MAX_MS) &&
      !hasRitualStartAtOrBefore(wMs, ritualMs)
    ) {
      strippedCloseness += 1;
      nextRaw.push({ at: w.at, mood: w.mood });
      continue;
    }
    nextRaw.push(raw);
  }

  if (strippedCloseness > 0) {
    parsed.wellbeing = nextRaw;
  }

  return {
    inspectedWithCloseness,
    strippedCloseness,
    storageUpdated: strippedCloseness > 0,
  };
}

async function read(): Promise<Stored> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const migrationDone = await AsyncStorage.getItem(LEGACY_ONBOARDING_CLOSENESS_MIGRATION_FLAG_KEY);

    if (!raw) {
      if (!migrationDone) {
        await AsyncStorage.setItem(LEGACY_ONBOARDING_CLOSENESS_MIGRATION_FLAG_KEY, "1").catch(() => {});
      }
      return emptyStored();
    }

    let body = raw;
    if (!migrationDone) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const ritualStarts = Array.isArray(parsed.ritualStarts)
          ? (parsed.ritualStarts as string[])
          : [];
        const dhikrCompletions = Array.isArray(parsed.dhikrCompletions)
          ? (parsed.dhikrCompletions as string[])
          : [];
        const { inspectedWithCloseness, strippedCloseness, storageUpdated } =
          migrateLegacyFakeOnboardingCloseness(parsed, ritualStarts, dhikrCompletions);
        if (storageUpdated) {
          body = JSON.stringify(parsed);
          await AsyncStorage.setItem(STORAGE_KEY, body);
        }
        if (__DEV__ && inspectedWithCloseness > 0) {
          console.log("[insights] legacy onboarding closeness migration", {
            inspectedWithCloseness,
            strippedCloseness,
            storageUpdated,
          });
        }
      } catch (e) {
        if (__DEV__) {
          console.warn("[insights] legacy onboarding closeness migration skipped (parse error)", e);
        }
      }
      await AsyncStorage.setItem(LEGACY_ONBOARDING_CLOSENESS_MIGRATION_FLAG_KEY, "1").catch(() => {});
    }

    const p = JSON.parse(body) as Partial<Stored>;
    const rawWellbeing = Array.isArray(p.wellbeing) ? p.wellbeing : [];
    const wellbeing = rawWellbeing
      .map(normalizeWellbeingEntry)
      .filter((x): x is StoredWellbeingEntry => x !== null);
    return {
      ritualStarts: Array.isArray(p.ritualStarts) ? p.ritualStarts : [],
      dhikrCompletions: Array.isArray(p.dhikrCompletions) ? p.dhikrCompletions : [],
      duaStarts: Array.isArray(p.duaStarts) ? p.duaStarts : [],
      wellbeing,
    };
  } catch {
    return emptyStored();
  }
}

async function write(data: Stored): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function appendIso(listKey: "ritualStarts" | "dhikrCompletions"): Promise<void> {
  const data = await read();
  const list = [...data[listKey], new Date().toISOString()];
  data[listKey] = list.slice(-MAX_EACH);
  await write(data);
}

export async function recordRitualSessionStarted(): Promise<void> {
  await appendIso("ritualStarts");
}

export async function recordDhikrCompleted(): Promise<void> {
  await appendIso("dhikrCompletions");
}

/**
 * Persists one wellbeing row. Mood (1–10) is required. Pass `closeness` only when the user submitted it
 * (guided ritual). Onboarding may persist mood alone. Invalid scores are dropped (no write).
 * Call sites that navigate or refresh Insights should `await` this first so AsyncStorage matches UI.
 */
export async function recordSessionWellbeing(mood: number, closeness?: number): Promise<void> {
  if (!isWellbeingScore(mood)) {
    if (__DEV__) {
      console.warn("[insights] wellbeing save skipped (invalid mood)", { mood, closeness });
    }
    return;
  }
  if (closeness !== undefined && !isWellbeingScore(closeness)) {
    if (__DEV__) {
      console.warn("[insights] wellbeing save skipped (invalid closeness)", { mood, closeness });
    }
    return;
  }
  const at = new Date().toISOString();
  const row: StoredWellbeingEntry =
    closeness !== undefined ? { at, mood, closeness } : { at, mood };
  const data = await read();
  data.wellbeing.push(row);
  data.wellbeing = data.wellbeing.slice(-MAX_EACH);
  await write(data);
  if (__DEV__) {
    console.log("[insights] wellbeing saved", row);
  }
}

async function backfillFromSessionsIfEmpty(sessions: DhikrSession[], data: Stored): Promise<Stored> {
  const empty =
    data.ritualStarts.length === 0 &&
    data.dhikrCompletions.length === 0 &&
    data.duaStarts.length === 0 &&
    data.wellbeing.length === 0;
  if (!empty || sessions.length === 0) return data;

  const next = { ...data };
  for (const s of sessions) {
    next.ritualStarts.push(s.completedAt);
    if (s.type === "dhikr") {
      next.dhikrCompletions.push(s.completedAt);
    }
    const wb = normalizeWellbeingEntry({
      at: s.completedAt,
      mood: s.mood,
      closeness: s.closeness,
    });
    if (wb) next.wellbeing.push(wb);
  }
  next.ritualStarts = next.ritualStarts.slice(-MAX_EACH);
  next.dhikrCompletions = next.dhikrCompletions.slice(-MAX_EACH);
  next.wellbeing = next.wellbeing.slice(-MAX_EACH);
  await write(next);
  return next;
}

export type { CalendarWeekDaySlot };

export type WeeklyInsights = {
  dhikrCount: number;
  duaCount: number;
  /** Mon → Sun slots for the current local calendar week; see {@link getWeeklyCompletionLog}. */
  weeklyCompletionLog: CalendarWeekDaySlot[];
  streak: number;
  longestStreak: number;
  avgMood: string;
  avgCloseness: string;
  showEmptyState: boolean;
};

export async function loadWeeklyInsights(sessions: DhikrSession[]): Promise<WeeklyInsights> {
  let data = await read();
  data = await backfillFromSessionsIfEmpty(sessions, data);

  const now = new Date();

  const dhikrCount = data.dhikrCompletions.filter((iso) =>
    isTimestampInLocalCalendarWeek(iso, now),
  ).length;
  const duaCount = sessions.filter(
    (s) => s.type === "dua" && isTimestampInLocalCalendarWeek(s.completedAt, now),
  ).length;

  const weeklyCompletionLog = getWeeklyCompletionLog(sessions, { now });

  const completionDayKeys = completionDayKeysSorted(sessions);
  const completionDaySet = new Set(completionDayKeys);
  const todayKey = localDayKey(now);
  const streak = streakEndingOn(completionDaySet, todayKey);
  const longestStreak = longestStreakFromSortedDayKeys(completionDayKeys);

  const wellbeingWeek = data.wellbeing.filter((w) => isTimestampInLocalCalendarWeek(w.at, now));
  const avgMood = averageWellbeingScores(wellbeingWeek.map((w) => w.mood));
  const closenessInWeek = wellbeingWeek.flatMap((w) =>
    w.closeness !== undefined && isWellbeingScore(w.closeness) ? [w.closeness] : [],
  );
  const avgCloseness = averageWellbeingScores(closenessInWeek);

  if (__DEV__) {
    console.log("[insights] weekly", {
      entriesInWindow: wellbeingWeek.length,
      avgMood,
      avgCloseness,
      totalWellbeingRows: data.wellbeing.length,
    });
  }

  const showEmptyState =
    sessions.length === 0 && data.dhikrCompletions.length === 0 && data.wellbeing.length === 0;

  return {
    dhikrCount,
    duaCount,
    weeklyCompletionLog,
    streak,
    longestStreak,
    avgMood,
    avgCloseness,
    showEmptyState,
  };
}
