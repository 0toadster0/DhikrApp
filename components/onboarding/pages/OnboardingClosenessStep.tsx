import React from "react";
import { Text, View } from "react-native";

import { SliderInput } from "@/components/SliderInput";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

export function OnboardingClosenessStep({
  closeness,
  onClosenessChange,
}: {
  closeness: number;
  onClosenessChange: (v: number) => void;
}) {
  return (
    <CenteredStep>
      <Text style={styles.stepTitle}>How close to Allah{"\n"}do you feel lately?</Text>
      <Text style={styles.stepSub}>No judgment. This is your private baseline.</Text>
      <View style={styles.sliderBlock}>
        <Text style={styles.sliderLabel}>
          {closeness <= 3
            ? "Distant"
            : closeness <= 6
              ? "Somewhere in between"
              : closeness <= 8
                ? "Connected"
                : "Very close"}
        </Text>
        <SliderInput value={closeness} onChange={onClosenessChange} min={1} max={10} />
        <Text style={styles.sliderHint}>1 = very distant · 10 = deeply connected</Text>
      </View>
    </CenteredStep>
  );
}
