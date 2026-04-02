import {
  SCREEN_TIME_REFLECT_LIFETIME_YEARS,
  SCREEN_TIME_REFLECT_QURAN_HOURS,
} from "@/constants/onboarding/screenTime";

export function formatIntegerWithCommas(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function computeScreenTimeReflection(dailyPhoneHours: number) {
  const hoursPerYear = Math.round(dailyPhoneHours * 365);
  const daysPerYear = Math.round(hoursPerYear / 24);
  const lifetimeYearsRaw = (dailyPhoneHours * SCREEN_TIME_REFLECT_LIFETIME_YEARS) / 24;
  const lifetimeRounded = Math.round(lifetimeYearsRaw * 10) / 10;
  const lifetimeDisplay = Number.isInteger(lifetimeRounded)
    ? String(lifetimeRounded)
    : lifetimeRounded.toFixed(1);
  const quranDays = Math.max(1, Math.round(SCREEN_TIME_REFLECT_QURAN_HOURS / dailyPhoneHours));
  const lifetimeIsWhole = Number.isInteger(lifetimeRounded);
  return {
    hoursPerYear,
    daysPerYear,
    lifetimeDisplay,
    lifetimeRounded,
    lifetimeIsWhole,
    quranDays,
  };
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
