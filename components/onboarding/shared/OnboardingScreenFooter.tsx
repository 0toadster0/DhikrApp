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
  continueDisabled: boolean;
};

export function OnboardingScreenFooter({
  step,
  nextLabel,
  onNext,
  isPaywallStep,
  continueDisabled,
}: OnboardingScreenFooterProps) {
  if (step === 2 || step === 12) return null;

  return (
    <View
      style={[
        styles.footer,
        isPaywallStep && styles.paywallFooter,
        step === 13 && styles.footerDhikrProgressOnly,
      ]}
    >
      {step !== 13 ? (
        <PrimaryButton
          label={nextLabel}
          onPress={onNext}
          style={[styles.nextBtn, isPaywallStep && styles.paywallCtaElevated]}
          contentContainerStyle={isPaywallStep ? styles.paywallPrimaryButtonInner : undefined}
          variant={isPaywallStep ? "gold" : "primary"}
          disabled={continueDisabled}
        />
      ) : null}
      <View style={[styles.bottomProgress, step === 13 && styles.bottomProgressDhikrSolo]}>
        <ProgressDots total={TOTAL_STEPS} current={step} variant="thin" />
      </View>
    </View>
  );
}
