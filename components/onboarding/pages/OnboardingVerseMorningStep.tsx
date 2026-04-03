import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { CenteredStep } from "../CenteredStep";
import { styles } from "../onboardingStyles";

const TARGET = 10;

type Props = {
  onDhikrCompleteChange: (complete: boolean) => void;
};

export function OnboardingVerseMorningStep({ onDhikrCompleteChange }: Props) {
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const pressed = useSharedValue(0);
  const floatY = useSharedValue(0);
  const haloPulse = useSharedValue(0);
  const tapEmphasis = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-2.2, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    haloPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [floatY, haloPulse]);

  useEffect(() => {
    if (count === TARGET) {
      onDhikrCompleteChange(true);
    }
  }, [count, onDhikrCompleteChange]);

  useEffect(() => {
    if (count >= TARGET) {
      glow.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    } else {
      glow.value = 0;
    }
  }, [count, glow]);

  useEffect(() => {
    if (count < 1) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(1.018, { damping: 18, stiffness: 320 }),
      withSpring(1, { damping: 20, stiffness: 260 }),
    );
    tapEmphasis.value = withSequence(
      withTiming(1, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }),
    );
  }, [count, scale, tapEmphasis]);

  const floatWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + haloPulse.value * 0.32,
    transform: [{ scale: 1 + haloPulse.value * 0.012 }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const pressScale = 1 - pressed.value * 0.012;
    return {
      transform: [{ scale: scale.value * pressScale }],
      shadowOpacity: 0.12 + glow.value * 0.14 + tapEmphasis.value * 0.08,
      shadowRadius: 18 + glow.value * 10 + tapEmphasis.value * 6,
      borderColor: `rgba(245,200,66,${0.22 + glow.value * 0.18 + tapEmphasis.value * 0.1})`,
    };
  });

  const counterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + tapEmphasis.value * 0.2,
    transform: [{ scale: 1 + tapEmphasis.value * 0.045 }],
  }));

  const handleTap = useCallback(() => {
    setCount((c) => (c >= TARGET ? c : c + 1));
  }, []);

  const complete = count >= TARGET;

  return (
    <CenteredStep style={local.stepRoot}>
      <View style={local.dhikrHeaderBlock}>
        <Ionicons name="book-outline" size={60} color="#C4A2F7" style={local.bookIcon} />
        <Text style={[styles.stepTitle, local.dhikrTitle]}>{"Let's begin your first dhikr!"}</Text>
      </View>
      <Pressable
        style={local.dhikrMiddle}
        disabled={complete}
        onPress={handleTap}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={local.dhikrCardHintStack}>
          <View style={local.cardStage}>
            <Animated.View pointerEvents="none" style={[local.glowHalo, haloAnimatedStyle]} />
            <Animated.View style={[local.floatWrap, floatWrapStyle]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tap the card once for each recitation of Alhamdulillah, up to ten times"
                accessibilityState={{ disabled: complete }}
                onPress={handleTap}
                onPressIn={() => {
                  if (complete) return;
                  pressed.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
                }}
                onPressOut={() => {
                  pressed.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
                }}
                style={local.cardPressable}
              >
                <Animated.View style={[styles.verseCard, local.verseCardElevated, cardAnimatedStyle]}>
                  <Text style={local.verseArabic}>الْحَمْدُ لِلَّهِ</Text>
                  <Text style={[styles.verseTranslit, local.verseTranslitMuted]}>Alhamdulillah</Text>
                  <Text style={[styles.verseTranslation, local.verseTranslationSoft]}>
                    Praise be to Allah
                  </Text>
                  <Animated.Text style={[local.dhikrProgress, counterAnimatedStyle]}>
                    {count} of {TARGET}
                  </Animated.Text>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>
          {complete ? (
            <Animated.Text
              entering={FadeIn.duration(520).easing(Easing.out(Easing.cubic))}
              style={local.completionLine}
            >
              Beautiful. You’ve completed your first dhikr.
            </Animated.Text>
          ) : (
            <Text style={[styles.stepSub, local.tapHint]}>Tap anywhere to count your dhikr</Text>
          )}
        </View>
      </Pressable>
    </CenteredStep>
  );
}

const local = StyleSheet.create({
  stepRoot: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    alignSelf: "stretch",
    justifyContent: "flex-start",
    paddingTop: 0,
    paddingBottom: 2,
    gap: 0,
  },
  /** Icon + title only — same 11px rhythm as before; do not change book/title styles. */
  dhikrHeaderBlock: {
    alignItems: "center",
    width: "100%",
    gap: 11,
  },
  /** Fills space below header; centers dhikr card + helper as one column on screen. */
  dhikrMiddle: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dhikrCardHintStack: {
    width: "100%",
    alignItems: "center",
    gap: 41,
    marginTop: -20,
  },
  dhikrTitle: {
    marginTop: 10,
    maxWidth: 320,
    lineHeight: 34,
    letterSpacing: 0.08,
  },
  tapHint: {
    marginTop: 0,
    paddingHorizontal: 12,
    color: "rgba(208,188,248,0.82)",
  },
  bookIcon: {
    opacity: 0.55,
    marginBottom: 0,
  },
  cardStage: {
    width: "100%",
    maxWidth: 356,
    alignSelf: "center",
    alignItems: "center",
  },
  glowHalo: {
    position: "absolute",
    left: 4,
    right: 4,
    top: 6,
    bottom: 6,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.42)",
    backgroundColor: "rgba(196,162,247,0.06)",
    shadowColor: "#B89AF0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  floatWrap: {
    width: "100%",
    alignItems: "center",
  },
  cardPressable: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  verseCardElevated: {
    paddingVertical: 26,
    paddingHorizontal: 26,
    gap: 11,
    shadowColor: "#C9B2EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.22)",
    backgroundColor: "rgba(38,22,62,0.78)",
  },
  verseArabic: {
    fontSize: 32,
    color: "#F5C842",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 46,
    marginTop: 0,
    marginBottom: 4,
    textShadowColor: "rgba(245,200,66,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  verseTranslitMuted: {
    color: "rgba(228,218,252,0.68)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 0,
  },
  verseTranslationSoft: {
    color: "rgba(232,226,248,0.76)",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.15,
    marginTop: 1,
  },
  dhikrProgress: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(244,238,255,0.88)",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  completionLine: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(224,208,255,0.88)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
    maxWidth: 300,
  },
});
