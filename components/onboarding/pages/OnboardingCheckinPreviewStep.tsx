import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CenteredStep } from "../CenteredStep";
import { OnboardingMascot } from "../OnboardingMascot";
import { styles } from "../onboardingStyles";

export function OnboardingCheckinPreviewStep() {
  return (
    <CenteredStep>
      <OnboardingMascot variant="mag" float />
      <Text style={styles.stepTitle}>Here's how your{"\n"}check-in works.</Text>
      <View style={styles.previewCards}>
        <View style={styles.previewCard}>
          <Text style={styles.previewIcon}>  </Text>
          <Text style={styles.previewCardTitle}>Quick check-in</Text>
          <Text style={styles.previewCardSub}>How are you feeling?</Text>
        </View>
        <View style={styles.previewCard}>
          <Ionicons name="heart" size={22} color="#C4A2F7" />
          <Text style={styles.previewCardTitle}>Closeness check</Text>
          <Text style={styles.previewCardSub}>How close to Allah?</Text>
        </View>
        <View style={styles.previewCard}>
          <Ionicons name="sparkles" size={22} color="#F5C842" />
          <Text style={styles.previewCardTitle}>dhikr or dua</Text>
          <Text style={styles.previewCardSub}>Under 30 seconds</Text>
        </View>
      </View>
    </CenteredStep>
  );
}
