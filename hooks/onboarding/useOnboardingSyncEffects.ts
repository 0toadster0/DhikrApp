import { useEffect, useRef } from "react";

import { hasBarrierPick } from "@/constants/onboarding/content";

export type OnboardingSyncEffectsParams = {
  isLoading: boolean;
  step: number;
  /** `state.profile.name` — dependency for name hydration when entering step 3. */
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
};

/** Hydrate name on step 3, phone hours after load, scroll lock, and validation hints. */
export function useOnboardingSyncEffects({
  isLoading,
  step,
  profileName,
  setUserNameInput,
  profileDailyPhoneHours,
  setDailyPhoneHours,
  setPhoneHoursScrollLock,
  selectedGoals,
  selectedTimesLength,
  setShowGoalsPickHint,
  setShowRelationshipPickHint,
}: OnboardingSyncEffectsParams): void {
  useEffect(() => {
    if (isLoading || step !== 3) return;
    const saved = profileName?.trim() ?? "";
    setUserNameInput(saved);
  }, [isLoading, step, profileName, setUserNameInput]);

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
    if (step !== 4 && step !== 8) setPhoneHoursScrollLock(false);
  }, [step, setPhoneHoursScrollLock]);

  useEffect(() => {
    if (step !== 6 && step !== 9) setShowGoalsPickHint(false);
    if (step !== 7) setShowRelationshipPickHint(false);
  }, [step, setShowGoalsPickHint, setShowRelationshipPickHint]);

  useEffect(() => {
    if (step === 6 && selectedGoals.length > 0) setShowGoalsPickHint(false);
    if (step === 9 && hasBarrierPick(selectedGoals)) setShowGoalsPickHint(false);
  }, [step, selectedGoals, setShowGoalsPickHint]);

  useEffect(() => {
    if (selectedTimesLength > 0) setShowRelationshipPickHint(false);
  }, [selectedTimesLength, setShowRelationshipPickHint]);
}
