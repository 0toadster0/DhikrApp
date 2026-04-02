import { SCREEN_H, SCREEN_W } from "@/constants/onboarding/dimensions";

/** Image slides 0–1: intro line vertical band and text max width (matches previous inline math). */
export function getImageSlideLayoutMetrics(insetsTop: number): {
  imageSlideIntroTop: number;
  imageSlideTextMaxW: number;
} {
  const imageSlideIntroTop = Math.max(insetsTop + 6, SCREEN_H * 0.105);
  const imageSlideTextMaxW = Math.min(Math.round(SCREEN_W * 0.84), SCREEN_W - 48);
  return { imageSlideIntroTop, imageSlideTextMaxW };
}
