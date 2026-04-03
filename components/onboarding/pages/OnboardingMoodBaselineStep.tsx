import React, { useEffect, useRef } from "react";
import { Platform, Text, View, type TextStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { SliderInput } from "@/components/SliderInput";

import { PhoneHoursLayoutScreen } from "../PhoneHoursLayoutScreen";
import { androidPhoneHoursTextFix } from "../shared/androidPhoneHoursTextFix";
import { styles } from "../onboardingStyles";

/** RN Web can show a focus/box outline around large text; hero is display-only. */
const heroNumWebStyle: TextStyle | undefined =
  Platform.OS === "web"
    ? ({
        outlineWidth: 0,
        outlineStyle: "none",
        // @ts-expect-error RN web supports userSelect on Text
        userSelect: "none",
      } as TextStyle)
    : undefined;

function dhikrFrequencyLabel(value: number): string {
  if (value <= 2) return "Almost never";
  if (value <= 4) return "Every now and then";
  if (value <= 6) return "A few times a week";
  if (value <= 8) return "Most days";
  return "Every day";
}

function DhikrFrequencyHeading({
  userName,
  emphasisColor,
}: {
  userName: string;
  emphasisColor: string;
}) {
  const accent = { color: emphasisColor };
  const trimmedName = userName.trim();

  if (trimmedName.length > 0) {
    return [
      <Text key="name" style={accent}>
        {trimmedName}
      </Text>,
      <Text key="comma">, how often do you make </Text>,
      <Text key="time" style={accent}>
        time
      </Text>,
      <Text key="for"> for </Text>,
      <Text key="dhikr">dhikr</Text>,
      <Text key="or"> or </Text>,
      <Text key="dua">dua</Text>,
      <Text key="rest"> per week?</Text>,
    ];
  }

  return [
    <Text key="lead">How often do you make </Text>,
    <Text key="time" style={accent}>
      time
    </Text>,
    <Text key="for"> for </Text>,
    <Text key="dhikr">dhikr</Text>,
    <Text key="or"> or </Text>,
    <Text key="dua">dua</Text>,
    <Text key="rest"> per week?</Text>,
  ];
}

const LABEL_SOFT_MS = 150;

function DhikrFrequencyAnimatedLabel({ mood }: { mood: number }) {
  const opacity = useSharedValue(1);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    opacity.value = 0.7;
    opacity.value = withTiming(1, { duration: LABEL_SOFT_MS });
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.phoneHoursMoodLabelFrequency, androidPhoneHoursTextFix, animatedStyle]}>
      {dhikrFrequencyLabel(mood)}
    </Animated.Text>
  );
}

function DhikrFrequencyHeroNumber({ value }: { value: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    opacity.value = withSequence(
      withTiming(0.72, { duration: 72 }),
      withTiming(1, { duration: 108 })
    );
    scale.value = withSequence(
      withTiming(1.05, { duration: 88 }),
      withTiming(1, { duration: 92 })
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      selectable={false}
      style={[styles.phoneHoursFrequencyHeroNum, androidPhoneHoursTextFix, heroNumWebStyle, animatedStyle]}
    >
      {value}
    </Animated.Text>
  );
}

export function OnboardingMoodBaselineStep({
  mood,
  onMoodChange,
  onPhoneHoursScrollLockChange,
  userName,
  emphasisColor,
}: {
  mood: number;
  onMoodChange: (v: number) => void;
  onPhoneHoursScrollLockChange: (locked: boolean) => void;
  /** Saved or in-progress name from the name step; used in the heading. */
  userName: string;
  emphasisColor: string;
}) {
  return (
    <PhoneHoursLayoutScreen
      title={<DhikrFrequencyHeading userName={userName} emphasisColor={emphasisColor} />}
      titleStyle={styles.phoneHoursHeadingFrequency}
      expandMiddleContent
    >
      <View style={styles.phoneHoursFrequencyStep}>
        <View style={styles.phoneHoursFrequencyHeroZone}>
          <DhikrFrequencyHeroNumber value={mood} />
        </View>
        <View style={styles.phoneHoursFrequencyLower}>
          <DhikrFrequencyAnimatedLabel mood={mood} />
          <View style={[styles.phoneHoursSliderStack, styles.phoneHoursSliderStackFrequency]}>
            <SliderInput
              value={mood}
              onChange={onMoodChange}
              min={1}
              max={10}
              omitValueDisplay
              snapToSteps
              hapticOnStep
              knobPulseOnStep
              trackEndLabels={{ left: "1", right: "10" }}
              onDragActiveChange={onPhoneHoursScrollLockChange}
            />
            <Text style={[styles.phoneHoursFrequencyReassurance, androidPhoneHoursTextFix]}>
              Even a few moments of remembrance matters
            </Text>
          </View>
        </View>
      </View>
    </PhoneHoursLayoutScreen>
  );
}
