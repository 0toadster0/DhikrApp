export const ONBOARDING_IMAGE_1 = require("@/assets/mascot/onboarding1.png");
export const ONBOARDING_IMAGE_2 = require("@/assets/mascot/onboarding2.png");

export const GOALS = [
  { id: "pray", label: "Pray more consistently" },
  { id: "time", label: "Waste less time" },
  { id: "closer", label: "Feel closer to Allah" },
  { id: "scroll", label: "Stop doomscrolling" },
  { id: "discipline", label: "Become more disciplined" },
  { id: "grateful", label: "Practice more gratitude" },
];

export const STRUGGLE_TIMES = [
  { id: "trust_plan", label: "Trusting Allah's plan, even when life feels uncertain" },
  { id: "faith_values", label: "Living in a way that reflects my faith and values" },
  { id: "turn_first", label: "Turning to Allah first when I feel overwhelmed" },
  { id: "time_matters", label: "Using my time and energy for what truly matters" },
  { id: "prayer_discipline", label: "Building my life around prayer, discipline, and remembrance" },
  { id: "closer_daily", label: "Becoming someone who is closer to Allah in everyday life" },
];

export const TOTAL_STEPS = 18;
export const USER_NAME_MAX_LENGTH = 25;

export const ONBOARDING_STREAK_WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export const ONBOARDING_REMINDER_OPTIONS = [
  { icon: "sunny-outline" as const, label: "Morning nudge" },
  { icon: "moon-outline" as const, label: "Before sleep" },
  { icon: "phone-portrait-outline" as const, label: "When you're about to scroll" },
] as const;
