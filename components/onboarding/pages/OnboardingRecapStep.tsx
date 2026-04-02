import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GOALS } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingRecapStep({
  selectedGoals,
  selectedAppsCount,
}: {
  selectedGoals: string[];
  selectedAppsCount: number;
}) {
  return (
    <CenteredStep>
      <Ionicons name="checkmark-circle-outline" size={60} color="#C4A2F7" />
      <Text style={styles.stepTitle}>You've done the{"\n"}hardest part already.</Text>
      <View style={styles.recapList}>
        {selectedGoals.slice(0, 2).map((g) => {
          const goal = GOALS.find((go) => go.id === g);
          return goal ? (
            <View key={g} style={styles.recapItem}>
              <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
              <Text style={styles.recapLabel}>{goal.label}</Text>
            </View>
          ) : null;
        })}
        <View style={styles.recapItem}>
          <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
          <Text style={styles.recapLabel}>{selectedAppsCount} apps to protect</Text>
        </View>
        <View style={styles.recapItem}>
          <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
          <Text style={styles.recapLabel}>Your baseline is set</Text>
        </View>
      </View>
      <Text style={styles.stepSub}>One small step is all it takes to start.</Text>
    </CenteredStep>
  );
}
