import { useEffect, useRef } from "react";

import { hasBarrierPick } from "@/constants/onboarding/content";

export type OnboardingSyncEffectsParams = {
  isLoading: boolean;
  step: number;
  /** `state.profile.ageRange` — hydrate when entering age step. */
  profileAgeRange: string | undefined;
  setAgeRange: (value: string | null) => void;
  /** `state.profile.name` — dependency for name hydration when entering name step. */
  profileName: string | undefined;
  setUserNameInput: (value: string) => void;
  /** Current `state.profile.dailyPhoneHours`; only applied when `isLoading` clears (same as inline effect deps). */
  profileDailyPhoneHours: number;
  setDailyPhoneHours: (value: number) => void;
  setPhoneHoursScrollLock: (locked: boolean) => void;
  selectedGoals: string[];
  selectedTimesLength: number;
  setShowGoalsPickHint: (show: boolean) => void;
  setShowRelationshipPickHint: (show: boolean) => void;
  ageRange: string | null;
  setShowAgeRangeHint: (show: boolean) => void;
  profileSex: string | undefined;
  setSex: (value: string | null) => void;
  sex: string | null;
  setShowSexHint: (show: boolean) => void;
};

/** Hydrate age / name, phone hours after load, scroll lock, and validation hints. */
export function useOnboardingSyncEffects({
  isLoading,
  step,
  profileAgeRange,
  setAgeRange,
  profileName,
  setUserNameInput,
  profileDailyPhoneHours,
  setDailyPhoneHours,
  setPhoneHoursScrollLock,
  selectedGoals,
  selectedTimesLength,
  setShowGoalsPickHint,
  setShowRelationshipPickHint,
  ageRange,
  setShowAgeRangeHint,
  profileSex,
  setSex,
  sex,
  setShowSexHint,
}: OnboardingSyncEffectsParams): void {
  useEffect(() => {
    if (isLoading || step !== 3) return;
    const saved = profileAgeRange?.trim();
    if (saved) setAgeRange(saved);
  }, [isLoading, step, profileAgeRange, setAgeRange]);

  useEffect(() => {
    if (isLoading || step !== 4) return;
    const saved = profileName?.trim() ?? "";
    setUserNameInput(saved);
  }, [isLoading, step, profileName, setUserNameInput]);

  useEffect(() => {
    if (isLoading || step !== 11) return;
    const saved = profileSex?.trim();
    if (saved) setSex(saved);
  }, [isLoading, step, profileSex, setSex]);

  const profileDailyPhoneHoursRef = useRef(profileDailyPhoneHours);
  profileDailyPhoneHoursRef.current = profileDailyPhoneHours;

  useEffect(() => {
    if (isLoading) return;
    const saved = profileDailyPhoneHoursRef.current;
    if (typeof saved === "number" && saved >= 1 && saved <= 10) {
      setDailyPhoneHours(saved);
    }
  }, [isLoading, setDailyPhoneHours]);

  useEffect(() => {
    if (step !== 5 && step !== 9) setPhoneHoursScrollLock(false);
  }, [step, setPhoneHoursScrollLock]);

  useEffect(() => {
    if (step !== 3) setShowAgeRangeHint(false);
    if (step !== 7 && step !== 10) setShowGoalsPickHint(false);
    if (step !== 8) setShowRelationshipPickHint(false);
    if (step !== 11) setShowSexHint(false);
  }, [step, setShowAgeRangeHint, setShowGoalsPickHint, setShowRelationshipPickHint, setShowSexHint]);

  useEffect(() => {
    if (step === 3 && ageRange != null) setShowAgeRangeHint(false);
    if (step === 7 && selectedGoals.length > 0) setShowGoalsPickHint(false);
    if (step === 10 && hasBarrierPick(selectedGoals)) setShowGoalsPickHint(false);
    if (step === 11 && sex != null) setShowSexHint(false);
  }, [step, ageRange, selectedGoals, sex, setShowAgeRangeHint, setShowGoalsPickHint, setShowSexHint]);

  useEffect(() => {
    if (selectedTimesLength > 0) setShowRelationshipPickHint(false);
  }, [selectedTimesLength, setShowRelationshipPickHint]);
}
