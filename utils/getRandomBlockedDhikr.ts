import { BLOCKED_DHIKR, type BlockedDhikr } from "@/constants/blockedDhikr";

export function getRandomBlockedDhikr(excludeId?: BlockedDhikr["id"]): BlockedDhikr {
  if (BLOCKED_DHIKR.length === 0) {
    throw new Error("BLOCKED_DHIKR must contain at least one dhikr.");
  }

  const availableDhikr = BLOCKED_DHIKR.filter((dhikr) => dhikr.id !== excludeId);
  const dhikrPool = availableDhikr.length > 0 ? availableDhikr : BLOCKED_DHIKR;
  const randomIndex = Math.floor(Math.random() * dhikrPool.length);

  return dhikrPool[randomIndex] ?? BLOCKED_DHIKR[0];
}
