import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { Platform } from "react-native";
import PostHog from "posthog-react-native";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

export const APP_OPEN_SOURCES = ["cold_start", "foreground_resume"] as const;
export type AppOpenSource = (typeof APP_OPEN_SOURCES)[number];

export const ONBOARDING_VARIANTS = ["default"] as const;
export type OnboardingVariant = (typeof ONBOARDING_VARIANTS)[number];

export const DHIKR_SOURCES = ["onboarding", "ritual"] as const;
export type DhikrSource = (typeof DHIKR_SOURCES)[number];

export const PERMISSION_TYPES = ["screen_time", "notifications"] as const;
export type PermissionType = (typeof PERMISSION_TYPES)[number];

export const PLAN_TYPES = ["yearly_trial"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export const REMINDER_TYPES = ["onboarding_test_notification", "morning_toggle"] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export type AnalyticsEventMap = {
  app_opened: {
    source: AppOpenSource;
    is_first_launch: boolean;
    days_since_first_open: number | null;
    is_within_first_7d: boolean | null;
  };
  first_app_opened: {
    is_first_launch: boolean;
    first_opened_at: string;
  };
  session_started: {
    source: AppOpenSource;
    is_first_launch: boolean;
  };
  onboarding_started: {
    onboarding_variant: OnboardingVariant;
  };
  onboarding_step_viewed: {
    step_name: string;
    step_index: number;
    onboarding_variant: OnboardingVariant;
  };
  onboarding_step_completed: {
    step_name: string;
    step_index: number;
  };
  onboarding_completed: {
    onboarding_variant: OnboardingVariant;
  };
  goal_selected: {
    goal_name: string;
  };
  obstacle_selected: {
    obstacle_name: string;
  };
  dhikr_started: {
    dhikr_id: string;
    dhikr_title: string;
    category: string;
    dhikr_source?: DhikrSource;
  };
  dhikr_completed: {
    dhikr_id: string;
    dhikr_title: string;
    category: string;
    duration_seconds: number | null;
    dhikr_source?: DhikrSource;
    streak_count?: number;
  };
  first_dhikr_completed: undefined;
  streak_unlocked: {
    streak_day: number;
  };
  permission_prompt_viewed: {
    permission_type: PermissionType;
  };
  permission_granted: {
    permission_type: PermissionType;
  };
  permission_denied: {
    permission_type: PermissionType;
  };
  paywall_viewed: {
    source_screen: string;
    trigger: string;
  };
  paywall_cta_clicked: {
    plan_type: PlanType;
  };
  subscription_started: {
    plan_type: PlanType;
  };
  subscription_completed: {
    plan_type: PlanType;
  };
  subscription_failed: {
    plan_type: PlanType;
    failure_reason: string;
  };
  app_blocking_setup_started: undefined;
  app_blocking_setup_completed:
    | {
        selected_blocked_apps_count?: number;
      }
    | undefined;
  reminder_set: {
    reminder_type: ReminderType;
  };
  reminder_opened: undefined;
};

const STORAGE_KEYS = {
  distinctId: "@analytics_distinct_id",
  firstAppOpenedAt: "@analytics_first_app_opened_at",
  firstDhikrCompleted: "@analytics_first_dhikr_completed",
} as const;

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST;

let client: PostHog | null = null;
let initialized = false;
let firstLaunch = false;
let distinctId: string | null = null;

const defaultContext = {
  platform: Platform.OS,
  app_version:
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    null,
  build_number:
    (Application.nativeBuildVersion ??
      String(
        Constants.expoConfig?.ios?.buildNumber ??
          Constants.expoConfig?.android?.versionCode ??
          "",
      )) ||
    null,
};

function randomId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sanitize(properties?: AnalyticsProperties): AnalyticsProperties | undefined {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

function isConfigured(): boolean {
  return Boolean(POSTHOG_KEY && POSTHOG_HOST);
}

async function ensureDistinctId(): Promise<string> {
  if (distinctId) return distinctId;
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.distinctId);
  if (stored) {
    distinctId = stored;
    return stored;
  }
  const generated = randomId();
  distinctId = generated;
  await AsyncStorage.setItem(STORAGE_KEYS.distinctId, generated);
  return generated;
}

export async function initAnalytics(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!isConfigured()) {
    return;
  }

  try {
    client = new PostHog(POSTHOG_KEY!, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: false,
    });

    const id = await ensureDistinctId();
    client.identify(id);
    await client.register(defaultContext);

    const firstOpenedAt = await AsyncStorage.getItem(STORAGE_KEYS.firstAppOpenedAt);
    firstLaunch = !firstOpenedAt;
    if (!firstOpenedAt) {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.firstAppOpenedAt, now);
      capture("first_app_opened", {
        is_first_launch: true,
        first_opened_at: now,
      });
    }
  } catch (error) {
    console.warn("Analytics init failed:", error);
  }
}

export async function trackAppOpened(source: AppOpenSource): Promise<void> {
  const firstOpenedAt = await AsyncStorage.getItem(STORAGE_KEYS.firstAppOpenedAt);
  const firstOpenDate = firstOpenedAt ? new Date(firstOpenedAt) : null;
  const now = new Date();
  const daysSinceFirstOpen = firstOpenDate
    ? Math.floor((now.getTime() - firstOpenDate.getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const isWithinFirst7Days = daysSinceFirstOpen !== null ? daysSinceFirstOpen <= 7 : null;

  capture("app_opened", {
    source,
    is_first_launch: firstLaunch,
    days_since_first_open: daysSinceFirstOpen,
    is_within_first_7d: isWithinFirst7Days,
  });
  capture("session_started", {
    source,
    is_first_launch: firstLaunch,
  });
}

export function identify(userId: string, traits?: AnalyticsProperties): void {
  try {
    if (!client) return;
    client.identify(userId, sanitize(traits));
  } catch (error) {
    console.warn("Analytics identify failed:", error);
  }
}

export function setUserProperties(traits?: AnalyticsProperties): void {
  try {
    if (!client || !traits) return;
    client.setPersonProperties(sanitize(traits) ?? {});
  } catch (error) {
    console.warn("Analytics setUserProperties failed:", error);
  }
}

type AnalyticsEventName = keyof AnalyticsEventMap;

export function capture<E extends AnalyticsEventName>(
  eventName: E,
  ...args: undefined extends AnalyticsEventMap[E]
    ? [properties?: Exclude<AnalyticsEventMap[E], undefined>]
    : [properties: AnalyticsEventMap[E]]
): void {
  try {
    if (!client) return;
    const properties = args[0] as AnalyticsProperties | undefined;
    client.capture(eventName, sanitize(properties));
  } catch (error) {
    console.warn(`Analytics capture failed for ${eventName}:`, error);
  }
}

export function screen(screenName: string, properties?: AnalyticsProperties): void {
  try {
    if (!client) return;
    void client.screen(screenName, sanitize(properties));
  } catch (error) {
    console.warn(`Analytics screen failed for ${screenName}:`, error);
  }
}

export function reset(): void {
  try {
    client?.reset();
  } catch (error) {
    console.warn("Analytics reset failed:", error);
  }
}

export async function hasCompletedFirstDhikr(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.firstDhikrCompleted);
  return value === "true";
}

export async function markFirstDhikrCompleted(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.firstDhikrCompleted, "true");
}
