import { QURANIC_DUAS, type Dua } from "@/constants/quranicDuas";

export function getRandomDua(excludeId?: Dua["id"]): Dua {
  if (QURANIC_DUAS.length === 0) {
    throw new Error("QURANIC_DUAS must contain at least one dua.");
  }

  const availableDuas = QURANIC_DUAS.filter((dua) => dua.id !== excludeId);
  const duaPool = availableDuas.length > 0 ? availableDuas : QURANIC_DUAS;
  const randomIndex = Math.floor(Math.random() * duaPool.length);

  return duaPool[randomIndex] ?? QURANIC_DUAS[0];
}
