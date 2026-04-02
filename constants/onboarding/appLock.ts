import type { LockAppId } from "@/components/NormalizedLockAppIcon";

export const APP_LOCK_APPS: Array<{ id: LockAppId; label: string }> = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
  { id: "x", label: "X" },
];

/** Onboarding app-lock step: logo +45% vs legacy 64px; corners track clip size */
export const APP_LOCK_ICON_CLIP = Math.round(64 * 1.45);
export const APP_LOCK_ICON_CLIP_RADIUS = Math.round(18 * 1.45);
export const APP_LOCK_ICON_IMAGE = APP_LOCK_ICON_CLIP;
