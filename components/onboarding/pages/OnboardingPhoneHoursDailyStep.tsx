import React from "react";
import { Text, View } from "react-native";

import { SliderInput } from "@/components/SliderInput";

import { PhoneHoursLayoutScreen } from "../PhoneHoursLayoutScreen";
import { styles } from "../onboardingStyles";

export function OnboardingPhoneHoursDailyStep({
  dailyPhoneHours,
  onDailyPhoneHoursChange,
  onPhoneHoursScrollLockChange,
}: {
  dailyPhoneHours: number;
  onDailyPhoneHoursChange: (v: number) => void;
  onPhoneHoursScrollLockChange: (locked: boolean) => void;
}) {
  return (
    <PhoneHoursLayoutScreen title="Be honest, how long do you spend on your phone daily?">
      <View style={styles.phoneHoursValueBlock}>
        <Text style={styles.phoneHoursBigNum}>{dailyPhoneHours}</Text>
        <Text style={styles.phoneHoursUnit}>{dailyPhoneHours === 1 ? "hour/day" : "hours/day"}</Text>
      </View>
      <SliderInput
        value={dailyPhoneHours}
        onChange={onDailyPhoneHoursChange}
        min={1}
        max={10}
        omitValueDisplay
        trackEndLabels={{ left: "1h", right: "10h" }}
        onDragActiveChange={onPhoneHoursScrollLockChange}
      />
    </PhoneHoursLayoutScreen>
  );
}
