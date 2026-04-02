import React from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingReadyStep({ displayName }: { displayName: string | undefined }) {
  return (
    <CenteredStep>
      <Ionicons name="moon" size={62} color="#F5C842" />
      <Text style={styles.stepTitle}>{displayName ? `You're ready, ${displayName}.` : "You're ready."}</Text>
      <Text style={styles.stepSub}>
        Even 30 seconds of remembrance can change the direction of your day.{"\n\n"}
        Let's begin.
      </Text>
    </CenteredStep>
  );
}
