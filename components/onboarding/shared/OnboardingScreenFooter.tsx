import { View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressDots } from "@/components/ProgressDots";
import { styles } from "@/components/onboarding/onboardingStyles";
import { TOTAL_STEPS } from "@/constants/onboarding/content";

export type OnboardingScreenFooterProps = {
  step: number;
  nextLabel: string;
  onNext: () => void;
  isPaywallStep: boolean;
  nameStepContinueDisabled: boolean;
};

export function OnboardingScreenFooter({
  step,
  nextLabel,
  onNext,
  isPaywallStep,
  nameStepContinueDisabled,
}: OnboardingScreenFooterProps) {
  if (step === 2) return null;

  return (
    <View style={styles.footer}>
      <PrimaryButton
        label={nextLabel}
        onPress={onNext}
        style={styles.nextBtn}
        variant={isPaywallStep ? "gold" : "primary"}
        disabled={nameStepContinueDisabled}
      />
      <View style={styles.bottomProgress}>
        <ProgressDots total={TOTAL_STEPS} current={step} variant="thin" />
      </View>
    </View>
  );
}
