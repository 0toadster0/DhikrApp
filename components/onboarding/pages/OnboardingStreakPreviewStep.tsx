import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ONBOARDING_STREAK_WEEKDAY_LABELS } from "@/constants/onboarding/content";

import { styles } from "../onboardingStyles";

const EASE_OUT = Easing.out(Easing.cubic);
const EMBER_START_SCALE = 0.88;

type Props = {
  /** After dhikr handoff: skip preview entrance animation so the screen matches the settled handoff. */
  suppressRewardEntrance?: boolean;
};

export function OnboardingStreakPreviewStep({ suppressRewardEntrance = false }: Props) {
  const emberOpacity = useSharedValue(suppressRewardEntrance ? 1 : 0);
  const emberScale = useSharedValue(suppressRewardEntrance ? 1 : EMBER_START_SCALE);
  const emberGlow = useSharedValue(suppressRewardEntrance ? 0.42 : 0.22);
  const day1Scale = useSharedValue(1);
  const shimmer = useSharedValue(suppressRewardEntrance ? 0.45 : 0);

  useEffect(() => {
    if (suppressRewardEntrance) {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(0.72, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.32, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
      emberGlow.value = withRepeat(
        withSequence(
          withTiming(0.52, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.36, { duration: 2300, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
      return;
    }

    emberOpacity.value = withDelay(60, withTiming(1, { duration: 480, easing: EASE_OUT }));
    emberScale.value = withDelay(
      60,
      withSequence(
        withTiming(1.04, { duration: 340, easing: EASE_OUT }),
        withTiming(1, { duration: 280, easing: Easing.inOut(Easing.cubic) }),
      ),
    );
    emberGlow.value = withDelay(
      80,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.34, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
    day1Scale.value = withDelay(
      200,
      withSequence(
        withTiming(1.08, { duration: 220, easing: EASE_OUT }),
        withTiming(1, { duration: 280, easing: EASE_OUT }),
      ),
    );
    shimmer.value = withDelay(
      320,
      withRepeat(
        withSequence(
          withTiming(0.88, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.22, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / suppress mode only
  }, [suppressRewardEntrance]);

  const emberStyle = useAnimatedStyle(() => ({
    opacity: emberOpacity.value,
    transform: [{ scale: emberScale.value }],
  }));

  const emberBloomStyle = useAnimatedStyle(() => ({
    opacity: emberGlow.value * 0.85,
    transform: [{ scale: 0.96 + emberGlow.value * 0.12 }],
  }));

  const day1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: day1Scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.35,
  }));

  const inner = (
    <>
      <Animated.View style={[local.emberStage, emberStyle]}>
        <Animated.View style={[local.emberBloom, emberBloomStyle]} />
        <Text style={local.emberGlyph} accessibilityElementsHidden>
          🔥
        </Text>
      </Animated.View>

      <Text style={styles.stepTitle}>How your streak works ✨</Text>

      <View style={styles.streakPreview}>
        {ONBOARDING_STREAK_WEEKDAY_LABELS.map((d, i) => {
          const isFirst = i === 0;
          if (isFirst) {
            return (
              <Animated.View key={i} style={[styles.streakDay1Wrap, day1AnimatedStyle]}>
                <View style={[styles.streakDay, styles.streakDayActive, { overflow: "hidden" }]}>
                  <Animated.View
                    pointerEvents="none"
                    style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.12)" }, shimmerStyle]}
                  />
                  <View style={styles.streakDay1Inner}>
                    <Text style={styles.streakDayFire} accessibilityElementsHidden>
                      🔥
                    </Text>
                    <Text style={[styles.streakDayLabel, { color: "#1a0a2e" }]}>{d}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          }
          return (
            <View key={i} style={[styles.streakDay, styles.streakDayInactive]}>
              <Text style={[styles.streakDayLabel, { color: "#9b80c8" }]}>{d}</Text>
            </View>
          );
        })}
      </View>

      <View style={local.copyBlock}>
        <Text style={[styles.stepSub, local.subLead]}>
          Intro dhikr done — it does not add to your streak yet.
        </Text>
        <Text style={[styles.stepSub, local.subTrail]}>
          After onboarding, finish dhikr or a dua each day to grow your streak.
        </Text>
      </View>
    </>
  );

  if (suppressRewardEntrance) {
    return <View style={[styles.centeredStep, styles.streakRewardStack]}>{inner}</View>;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(520).delay(48).damping(20).stiffness(200)}
      style={[styles.centeredStep, styles.streakRewardStack]}
    >
      {inner}
    </Animated.View>
  );
}

const local = StyleSheet.create({
  emberStage: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 108,
    height: 96,
  },
  emberBloom: {
    position: "absolute",
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: "rgba(184,148,245,0.18)",
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.22)",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 10,
  },
  emberGlyph: {
    fontSize: 54,
    lineHeight: 62,
    textShadowColor: "rgba(196,162,247,0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  copyBlock: {
    alignItems: "center",
    gap: 28,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  subLead: {
    textAlign: "center",
    marginBottom: 0,
    color: "rgba(240,234,255,0.92)",
    fontFamily: "Inter_500Medium",
  },
  subTrail: {
    textAlign: "center",
    marginTop: 0,
    color: "rgba(196,162,247,0.72)",
    fontSize: 14,
    lineHeight: 22,
  },
});
