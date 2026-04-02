import { useCallback, type Dispatch, type SetStateAction } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import type { AnimatedStyle } from "react-native-reanimated";
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

import type { UserProfile } from "@/context/AppContext";
import { hasBarrierPick, TOTAL_STEPS } from "@/constants/onboarding/content";

export type OnboardingNavigationParams = {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  userNameInput: string;
  selectedGoals: string[];
  selectedTimes: string[];
  dailyPhoneHours: number;
  mood: number;
  closeness: number;
  selectedApps: string[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingStep: (step: number) => void;
  setReflectAnimSession: Dispatch<SetStateAction<number>>;
  setSelectedGoals: Dispatch<SetStateAction<string[]>>;
  setSelectedTimes: Dispatch<SetStateAction<string[]>>;
  setShowGoalsPickHint: (show: boolean) => void;
  setShowRelationshipPickHint: (show: boolean) => void;
};

export type OnboardingNavigation = {
  goNext: () => void;
  goBack: () => void;
  toggleGoal: (id: string) => void;
  toggleTime: (id: string) => void;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
};

export function useOnboardingNavigation({
  step,
  setStep,
  userNameInput,
  selectedGoals,
  selectedTimes,
  dailyPhoneHours,
  mood,
  closeness,
  selectedApps,
  updateProfile,
  setOnboardingStep,
  setReflectAnimSession,
  setSelectedGoals,
  setSelectedTimes,
  setShowGoalsPickHint,
  setShowRelationshipPickHint,
}: OnboardingNavigationParams): OnboardingNavigation {
  const multiSelectShakeX = useSharedValue(0);

  const goalsMultiSelectShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: multiSelectShakeX.value }],
  }));

  const finishOnboarding = useCallback(() => {
    updateProfile({
      goals: selectedGoals,
      appsToBlock: selectedApps,
      struggleTimes: selectedTimes,
      dailyPhoneHours,
      moodBaseline: mood,
      closenessBaseline: closeness,
      onboardingComplete: true,
    });
    router.replace("/(tabs)");
  }, [
    selectedGoals,
    selectedApps,
    selectedTimes,
    dailyPhoneHours,
    mood,
    closeness,
    updateProfile,
  ]);

  const goNext = useCallback(() => {
    const goalsPickBlocked =
      (step === 6 && selectedGoals.length === 0) || (step === 9 && !hasBarrierPick(selectedGoals));
    if (goalsPickBlocked) {
      setShowGoalsPickHint(true);
      multiSelectShakeX.value = withSequence(
        withTiming(7, { duration: 42 }),
        withTiming(-7, { duration: 42 }),
        withTiming(5, { duration: 38 }),
        withTiming(-5, { duration: 38 }),
        withTiming(3, { duration: 34 }),
        withTiming(0, { duration: 36 })
      );
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (step === 7 && selectedTimes.length === 0) {
      setShowRelationshipPickHint(true);
      multiSelectShakeX.value = withSequence(
        withTiming(7, { duration: 42 }),
        withTiming(-7, { duration: 42 }),
        withTiming(5, { duration: 38 }),
        withTiming(-5, { duration: 38 }),
        withTiming(3, { duration: 34 }),
        withTiming(0, { duration: 36 })
      );
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 3) {
      const trimmed = userNameInput.trim();
      if (!trimmed) return;
      updateProfile({ name: trimmed });
    }
    if (step === 4) {
      updateProfile({ dailyPhoneHours });
      setReflectAnimSession((s) => s + 1);
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      setOnboardingStep(step + 1);
    } else {
      finishOnboarding();
    }
  }, [
    step,
    userNameInput,
    dailyPhoneHours,
    selectedGoals,
    selectedTimes.length,
    updateProfile,
    setOnboardingStep,
    setStep,
    setReflectAnimSession,
    setShowGoalsPickHint,
    setShowRelationshipPickHint,
    multiSelectShakeX,
    finishOnboarding,
  ]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step, setStep]);

  const toggleGoal = useCallback(
    (id: string) => {
      void Haptics.selectionAsync();
      setSelectedGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
    },
    [setSelectedGoals]
  );

  const toggleTime = useCallback(
    (id: string) => {
      void Haptics.selectionAsync();
      setSelectedTimes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    },
    [setSelectedTimes]
  );

  return { goNext, goBack, toggleGoal, toggleTime, goalsMultiSelectShakeStyle };
}
