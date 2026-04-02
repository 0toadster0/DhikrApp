import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { styles } from "@/components/onboarding/onboardingStyles";

export type OnboardingScreenHeaderProps = {
  isImageStep: boolean;
  topPadding: number;
  showBack: boolean;
  onBack: () => void;
};

export function OnboardingScreenHeader({
  isImageStep,
  topPadding,
  showBack,
  onBack,
}: OnboardingScreenHeaderProps) {
  if (isImageStep) {
    return (
      <View style={[styles.headerImage, styles.headerAbsolute, { top: topPadding }]}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="rgba(196,162,247,0.7)" />
          </Pressable>
        ) : (
          <View style={styles.backBtnSmall} />
        )}
        <View style={styles.backBtnSmall} />
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="rgba(196,162,247,0.7)" />
        </Pressable>
      ) : (
        <View style={styles.backBtn} />
      )}
      <View style={styles.backBtn} />
    </View>
  );
}
