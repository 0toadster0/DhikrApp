import type { DhikrSession } from "@/context/AppContext";

/**
 * Local calendar day key (device timezone). Used for daily completion logs and streak day sets.
 */
export function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseCompletedAtMs(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : NaN;
}

/**
 * Finished dhikr/dua sessions that count toward daily completion (persisted `completeSession` only).
 * Invalid `completedAt` values are excluded.
 */
export function sessionsEligibleForDailyCompletion(sessions: DhikrSession[]): DhikrSession[] {
  return sessions.filter((s) => {
    if (s.type !== "dhikr" && s.type !== "dua") return false;
    return Number.isFinite(parseCompletedAtMs(s.completedAt));
  });
}

/**
 * Whether the user completed at least one eligible dhikr or dua on the given local calendar day.
 * `dayKey` must be `YYYY-MM-DD` from {@link localDayKey}.
 */
export function didCompleteOnDate(dayKey: string, sessions: DhikrSession[]): boolean {
  for (const s of sessionsEligibleForDailyCompletion(sessions)) {
    if (localDayKey(new Date(s.completedAt)) === dayKey) return true;
  }
  return false;
}

/** Sorted unique local day keys with any eligible completion (streak / history; not the weekly row). */
export function completionDayKeysSorted(sessions: DhikrSession[]): string[] {
  const keys = new Set<string>();
  for (const s of sessionsEligibleForDailyCompletion(sessions)) {
    keys.add(localDayKey(new Date(s.completedAt)));
  }
  return [...keys].sort();
}

function startOfMondayLocalWeek(d: Date): Date {
  const x = startOfLocalDay(d);
  const dow = x.getDay();
  const daysSinceMonday = (dow + 6) % 7;
  x.setDate(x.getDate() - daysSinceMonday);
  return x;
}

/**
 * Monday 00:00:00 through Sunday 23:59:59.999 in the device’s local timezone,
 * for the week that contains `now`.
 */
export function localCalendarWeekBounds(now: Date = new Date()): {
  mondayStart: Date;
  sundayEnd: Date;
} {
  const mondayStart = startOfMondayLocalWeek(now);
  const sundayEnd = new Date(mondayStart);
  sundayEnd.setDate(mondayStart.getDate() + 6);
  sundayEnd.setHours(23, 59, 59, 999);
  return { mondayStart, sundayEnd };
}

export function isTimestampInLocalCalendarWeek(iso: string, now: Date = new Date()): boolean {
  const t = parseCompletedAtMs(iso);
  if (!Number.isFinite(t)) return false;
  const { mondayStart, sundayEnd } = localCalendarWeekBounds(now);
  return t >= mondayStart.getTime() && t <= sundayEnd.getTime();
}

export type CalendarWeekDaySlot = {
  /** Local calendar date `YYYY-MM-DD` for this column (Mon → Sun). */
  dayKey: string;
  /** At least one finished dhikr or dua that day; always false for future days in the week. */
  completedThisDay: boolean;
  /** Local calendar day is strictly after today within the viewed week. */
  isFuture: boolean;
};

export type GetWeeklyCompletionLogOptions = {
  /** Defaults to `new Date()`; use one value per load so counts and row stay consistent. */
  now?: Date;
};

/**
 * Monday → Sunday daily completion for the local calendar week containing `now`.
 * Derived only from persisted completed sessions; future week days are never marked complete.
 */
export function getWeeklyCompletionLog(
  sessions: DhikrSession[],
  options?: GetWeeklyCompletionLogOptions,
): CalendarWeekDaySlot[] {
  const now = options?.now ?? new Date();
  const todayKey = localDayKey(now);
  const monday = startOfMondayLocalWeek(now);
  const completionKeys = new Set<string>();
  for (const s of sessionsEligibleForDailyCompletion(sessions)) {
    completionKeys.add(localDayKey(new Date(s.completedAt)));
  }
  const out: CalendarWeekDaySlot[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayKey = localDayKey(d);
    const isFuture = dayKey > todayKey;
    out.push({
      dayKey,
      completedThisDay: isFuture ? false : completionKeys.has(dayKey),
      isFuture,
    });
  }
  return out;
}

/** Consecutive local days with completion ending on `endKey` (`YYYY-MM-DD`). Streak-only helper. */
export function streakEndingOn(dayKeys: Set<string>, endKey: string): number {
  if (!dayKeys.has(endKey)) return 0;
  let streak = 0;
  let cursor = new Date(
    Number(endKey.slice(0, 4)),
    Number(endKey.slice(5, 7)) - 1,
    Number(endKey.slice(8, 10)),
  );
  for (;;) {
    const k = localDayKey(cursor);
    if (!dayKeys.has(k)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive local days present in sorted keys. Streak-only helper. */
export function longestStreakFromSortedDayKeys(sortedDayKeys: string[]): number {
  if (sortedDayKeys.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDayKeys.length; i++) {
    const prev = new Date(
      Number(sortedDayKeys[i - 1].slice(0, 4)),
      Number(sortedDayKeys[i - 1].slice(5, 7)) - 1,
      Number(sortedDayKeys[i - 1].slice(8, 10)),
    );
    const cur = new Date(
      Number(sortedDayKeys[i].slice(0, 4)),
      Number(sortedDayKeys[i].slice(5, 7)) - 1,
      Number(sortedDayKeys[i].slice(8, 10)),
    );
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}
