import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, View } from "react-native";

import { ProgressDots } from "@/components/ProgressDots";
import { styles } from "@/components/onboarding/onboardingStyles";
import { TOTAL_STEPS } from "@/constants/onboarding/content";

export type OnboardingImageStepChromeProps = {
  bottomPadding: number;
  primaryColor: string;
  primaryForeground: string;
  currentStep: number;
  onContinue: () => void;
};

export function OnboardingImageStepChrome({
  bottomPadding,
  primaryColor,
  primaryForeground,
  currentStep,
  onContinue,
}: OnboardingImageStepChromeProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue"
        onPress={onContinue}
        style={[
          styles.imageStepArrowFab,
          {
            bottom: bottomPadding + 68,
            backgroundColor: primaryColor,
          },
        ]}
        hitSlop={12}
      >
        <Ionicons name="arrow-forward" size={26} color={primaryForeground} />
      </Pressable>
      <View
        style={[
          styles.imageBottomProgress,
          { bottom: Platform.OS === "web" ? 12 : bottomPadding + 20 },
        ]}
      >
        <ProgressDots total={TOTAL_STEPS} current={currentStep} variant="thin" />
      </View>
    </>
  );
}
