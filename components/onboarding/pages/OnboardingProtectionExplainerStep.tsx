import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingProtectionExplainerStep() {
  return (
    <CenteredStep>
      <Ionicons name="shield-checkmark-outline" size={60} color="#C4A2F7" />
      <Text style={styles.stepTitle}>How the{"\n"}protection works.</Text>
      <View style={styles.permissionExplain}>
        <Text style={styles.permExplainBody}>
          Dhikr uses Screen Time access to gently pause your selected apps until your check-in is complete.{"\n\n"}
          You stay in complete control — you can always adjust or remove any protected app at any time.{"\n\n"}
          No data is shared. Everything stays private on your device.
        </Text>
      </View>
    </CenteredStep>
  );
}
