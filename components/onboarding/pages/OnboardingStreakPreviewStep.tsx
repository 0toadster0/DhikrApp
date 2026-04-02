import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ONBOARDING_STREAK_WEEKDAY_LABELS } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingStreakPreviewStep() {
  return (
    <CenteredStep>
      <Ionicons name="sparkles" size={60} color="#F5C842" />
      <Text style={styles.stepTitle}>Small consistency{"\n"}matters most.</Text>
      <View style={styles.streakPreview}>
        {ONBOARDING_STREAK_WEEKDAY_LABELS.map((d, i) => (
          <View key={i} style={[styles.streakDay, i < 4 && styles.streakDayActive]}>
            <Text style={[styles.streakDayLabel, { color: i < 4 ? "#1a0a2e" : "#9b80c8" }]}>{d}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.stepSub}>
        Every day you complete your check-in builds your streak.{"\n"}
        Not perfection — just return.
      </Text>
    </CenteredStep>
  );
}
