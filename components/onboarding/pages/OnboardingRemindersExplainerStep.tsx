import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ONBOARDING_REMINDER_OPTIONS } from "@/constants/onboarding/content";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingRemindersExplainerStep() {
  const option = ONBOARDING_REMINDER_OPTIONS[0];

  return (
    <CenteredStep style={styles.remindersExplainerRoot}>
      <View style={styles.remindersIconWrap}>
        <Ionicons name="notifications-outline" size={60} color="#C4A2F7" />
      </View>
      <Text style={[styles.stepTitle, styles.remindersExplainerTitle]}>
        Let us remind you{"\n"}before distraction sets in.
      </Text>
      <View style={styles.remindersMiddle}>
        <View style={styles.remindersCardShell}>
          <View style={styles.remindersCardGlow} pointerEvents="none" />
          <View style={styles.remindersCard}>
            <Ionicons name={option.icon} size={22} color="#C4A2F7" />
            <Text style={styles.remindersCardLabel}>{option.label}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.stepSub}>A gentle reminder right before you get pulled in.</Text>
    </CenteredStep>
  );
}
