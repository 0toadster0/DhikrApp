export const ONBOARDING_STEP_NAMES: Record<number, string> = {
  0: "intro_welcome",
  1: "intro_value",
  2: "app_lock_intro",
  3: "age_range",
  4: "name_journey",
  5: "phone_hours",
  6: "screen_time_reflection",
  7: "goal_selection",
  8: "intent_relationship",
  9: "mood_baseline",
  10: "obstacle_selection",
  11: "sex",
  12: "checkin_preview",
  13: "first_sample_dhikr",
  14: "streak_unlock",
  15: "screen_time_permission",
  16: "notifications_permission",
  17: "recap",
  18: "paywall",
  19: "ready",
};

export function getOnboardingStepName(stepIndex: number): string {
  return ONBOARDING_STEP_NAMES[stepIndex] ?? `step_${stepIndex}`;
}
