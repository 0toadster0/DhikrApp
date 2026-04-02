import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ONBOARDING_REMINDER_OPTIONS } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingRemindersExplainerStep() {
  return (
    <CenteredStep>
      <Ionicons name="notifications-outline" size={60} color="#C4A2F7" />
      <Text style={styles.stepTitle}>Let us remind you{"\n"}before distraction sets in.</Text>
      <View style={styles.notifList}>
        {ONBOARDING_REMINDER_OPTIONS.map((n) => (
          <View key={n.label} style={styles.notifItem}>
            <Ionicons name={n.icon} size={20} color="#C4A2F7" />
            <Text style={styles.notifLabel}>{n.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.stepSub}>Reminders that feel like a gentle hand on your shoulder, not a loud alarm.</Text>
    </CenteredStep>
  );
}
