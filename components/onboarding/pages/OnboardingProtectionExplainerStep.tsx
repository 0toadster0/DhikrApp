import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingProtectionExplainerStep() {
  return (
    <CenteredStep style={styles.protectionStep}>
      <View style={styles.protectionIconStage}>
        <View style={styles.protectionIconGlow} />
        <View style={styles.protectionIconSurface}>
          <Ionicons name="shield-checkmark-outline" size={46} color="#D8C4FB" />
        </View>
      </View>
      <Text style={styles.protectionTitle}>Protect your time from distraction</Text>
      <View style={styles.protectionExplanationCard}>
        <Text style={styles.protectionBody}>
          This app uses Screen Time to gently block distractions when you need focus most.
        </Text>
        <Text style={styles.protectionControlNote}>You're always in control.</Text>
      </View>
      <Text style={styles.protectionPermissionHint}>This will open Apple Screen Time settings</Text>
    </CenteredStep>
  );
}
