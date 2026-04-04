import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
  ONBOARDING_STREAK_DAY_CELL_SIZE,
  ONBOARDING_STREAK_DAY_ROW_GAP,
  ONBOARDING_STREAK_WEEKDAY_LABELS,
} from "@/constants/onboarding/content";

import { styles } from "../onboardingStyles";

const TARGET = 10;
const easeOutCubic = Easing.out(Easing.cubic);

/** Brief beat after last tap before the handoff sequence (ms). */
const PRE_HANDOFF_MS = 120;
/** Delay after handoff beat before fire appears (ms). */
const FIRE_EMERGE_DELAY_MS = 90;
/** Dhikr → streak-preview crossfade: simultaneous, keep overlap brief (ms). */
const CROSSFADE_MS = 260;
/** Subtle full-screen dim peak during crossfade (0–1 multiplier → rgba). */
const TRANSITION_DIM_PEAK = 0.14;
/** Fire: fade in + scale 0.6 → 1.0 (ms). */
const FIRE_EMERGE_MS = 200;
/** “Ignite and grow” 1 → 1.18 → 1.28 — keep total in 500–800ms band (ms). */
const IGNITE_TO_A_MS = 220;
const IGNITE_TO_B_MS = 300;
/** Pause at peak before travel (ms). */
const FIRE_HOLD_MS = 90;
/** Guided travel to Day 1 (ms). */
const TRAVEL_MS = 600;
/** Fire settles into slot; Day 1 activates (ms). */
const LAND_MS = 260;
/** Headline after Day 1 glow + scale pop settles (pop ~440ms) (ms). */
const HEADLINE_DELAY_MS = 460;
const HEADLINE_FADE_MS = 340;
/** Subtext after headline (ms). */
const SUB_DELAY_MS = 160;
const SUB_FADE_MS = 300;
/** Let copy read before advancing to “Keep going” step (ms). */
const AFTER_SUB_ADVANCE_MS = 260;

const FIRE_START_SCALE = 0.6;

type Props = {
  onAdvance: () => void;
};

export function OnboardingVerseMorningStep({ onAdvance }: Props) {
  const [count, setCount] = useState(0);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const pressed = useSharedValue(0);
  const floatY = useSharedValue(0);
  const haloPulse = useSharedValue(0);
  const tapEmphasis = useSharedValue(0);
  const completionPulse = useSharedValue(0);

  const dhikrShellOpacity = useSharedValue(1);
  const streakShellOpacity = useSharedValue(0);
  const fireOverlayOpacity = useSharedValue(0);
  const fireScale = useSharedValue(FIRE_START_SCALE);
  const fireTx = useSharedValue(0);
  const fireTy = useSharedValue(0);
  const fireFlicker = useSharedValue(0.5);
  const fireBloomScale = useSharedValue(0.82);
  const fireRingScale = useSharedValue(0.92);
  const fireRingOpacity = useSharedValue(0);
  const landed = useSharedValue(0);
  const day1Scale = useSharedValue(1);
  const day1Halo = useSharedValue(0);
  const headlineOpacity = useSharedValue(0);
  const subOpacity = useSharedValue(0);
  const innerFireOpacity = useSharedValue(0);
  const transitionDimOpacity = useSharedValue(0);

  const advanceOnceRef = useRef(false);
  const handoffStartedRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const rootRef = useRef<View>(null);
  const day1Ref = useRef<View>(null);
  const rootCenterRef = useRef({ x: 0, y: 0 });

  const commitAdvance = useCallback(() => {
    if (advanceOnceRef.current) return;
    advanceOnceRef.current = true;
    onAdvanceRef.current();
  }, []);

  const onRootLayout = useCallback(() => {
    requestAnimationFrame(() => {
      rootRef.current?.measureInWindow((x, y, w, h) => {
        rootCenterRef.current = { x: x + w / 2, y: y + h / 2 };
      });
    });
  }, []);

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
    if (count >= TARGET) {
      glow.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    } else {
      glow.value = 0;
    }
  }, [count, glow]);

  useEffect(() => {
    if (count < 1) return;
    if (count !== TARGET) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (count === TARGET) {
      completionPulse.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(0.42, { duration: 480, easing: Easing.inOut(Easing.cubic) }),
      );
      scale.value = withSequence(
        withSpring(1.026, { damping: 17, stiffness: 300 }),
        withSpring(1.006, { damping: 22, stiffness: 280 }),
        withSpring(1, { damping: 20, stiffness: 260 }),
      );
      tapEmphasis.value = withSequence(
        withTiming(1, { duration: 90, easing: Easing.out(Easing.cubic) }),
        withTiming(0.55, { duration: 420, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }),
      );
      return;
    }

    scale.value = withSequence(
      withSpring(1.018, { damping: 18, stiffness: 320 }),
      withSpring(1, { damping: 20, stiffness: 260 }),
    );
    tapEmphasis.value = withSequence(
      withTiming(1, { duration: 70, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }),
    );
  }, [count, scale, tapEmphasis, completionPulse]);

  const runTravelAnimations = useCallback(
    (finalTx: number, finalTy: number) => {
      fireTx.value = withTiming(finalTx, { duration: TRAVEL_MS, easing: easeOutCubic });
      fireTy.value = withTiming(finalTy, { duration: TRAVEL_MS, easing: easeOutCubic });
      fireScale.value = withTiming(0.5, { duration: TRAVEL_MS, easing: easeOutCubic });
      fireBloomScale.value = withTiming(0.88, { duration: TRAVEL_MS, easing: easeOutCubic });
      fireRingOpacity.value = withTiming(0, { duration: TRAVEL_MS * 0.75, easing: easeOutCubic });
      streakShellOpacity.value = withTiming(1, { duration: CROSSFADE_MS, easing: easeOutCubic });
      dhikrShellOpacity.value = withTiming(0, { duration: CROSSFADE_MS, easing: easeOutCubic });
      transitionDimOpacity.value = withSequence(
        withTiming(1, { duration: Math.round(CROSSFADE_MS * 0.45), easing: easeOutCubic }),
        withTiming(0, { duration: Math.round(CROSSFADE_MS * 0.55), easing: easeOutCubic }),
      );
    },
    [
      dhikrShellOpacity,
      fireBloomScale,
      fireRingOpacity,
      fireScale,
      fireTx,
      fireTy,
      streakShellOpacity,
      transitionDimOpacity,
    ],
  );

  const measureAndTravel = useCallback(() => {
    const { x: rcx, y: rcy } = rootCenterRef.current;
    const rowWidth =
      7 * ONBOARDING_STREAK_DAY_CELL_SIZE + 6 * ONBOARDING_STREAK_DAY_ROW_GAP;
    const firstCenterOffset = -(rowWidth / 2) + ONBOARDING_STREAK_DAY_CELL_SIZE / 2;
    const applyTravel = (tcx: number, tcy: number) => {
      runTravelAnimations(tcx - rcx, tcy - rcy - 8);
    };

    const node = day1Ref.current;
    if (!node) {
      applyTravel(rcx + firstCenterOffset, rcy + 88);
      return;
    }
    node.measureInWindow((dx, dy, dw, dh) => {
      if (dw > 0 && dh > 0) {
        applyTravel(dx + dw / 2, dy + dh / 2);
      } else {
        applyTravel(rcx + firstCenterOffset, rcy + 88);
      }
    });
  }, [runTravelAnimations]);

  const runLandAndReveal = useCallback(() => {
    cancelAnimation(fireFlicker);
    fireFlicker.value = 0.52;
    fireOverlayOpacity.value = withTiming(0, { duration: LAND_MS, easing: easeOutCubic });
    landed.value = withTiming(1, { duration: LAND_MS, easing: easeOutCubic });
    innerFireOpacity.value = withTiming(1, { duration: LAND_MS + 100, easing: easeOutCubic });
    day1Halo.value = withTiming(1, { duration: LAND_MS + 200, easing: easeOutCubic });
    day1Scale.value = withSequence(
      withTiming(1.08, { duration: 200, easing: easeOutCubic }),
      withTiming(1, { duration: 240, easing: easeOutCubic }),
    );
  }, [day1Halo, day1Scale, fireFlicker, fireOverlayOpacity, innerFireOpacity, landed]);

  useEffect(() => {
    if (count !== TARGET) return;
    if (handoffStartedRef.current) return;
    handoffStartedRef.current = true;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const timers: ReturnType<typeof setTimeout>[] = [];

    const fireSequenceAt = PRE_HANDOFF_MS + FIRE_EMERGE_DELAY_MS;
    timers.push(
      setTimeout(() => {
        fireOverlayOpacity.value = withTiming(1, { duration: FIRE_EMERGE_MS * 0.85, easing: easeOutCubic });
        fireScale.value = withTiming(1, { duration: FIRE_EMERGE_MS, easing: easeOutCubic });
        fireBloomScale.value = withTiming(1, { duration: FIRE_EMERGE_MS, easing: easeOutCubic });
      }, fireSequenceAt),
    );

    const igniteAt = fireSequenceAt + FIRE_EMERGE_MS;
    timers.push(
      setTimeout(() => {
        fireScale.value = withSequence(
          withTiming(1.18, { duration: IGNITE_TO_A_MS, easing: easeOutCubic }),
          withTiming(1.28, { duration: IGNITE_TO_B_MS, easing: easeOutCubic }),
        );
        fireBloomScale.value = withSequence(
          withTiming(1.22, { duration: IGNITE_TO_A_MS, easing: easeOutCubic }),
          withTiming(1.32, { duration: IGNITE_TO_B_MS, easing: easeOutCubic }),
        );
        fireRingOpacity.value = withSequence(
          withTiming(0.38, { duration: IGNITE_TO_A_MS * 0.65, easing: easeOutCubic }),
          withTiming(0.22, { duration: IGNITE_TO_B_MS, easing: Easing.inOut(Easing.sin) }),
        );
        fireRingScale.value = withSequence(
          withTiming(1.18, { duration: IGNITE_TO_A_MS + IGNITE_TO_B_MS, easing: easeOutCubic }),
          withTiming(1.08, { duration: 160, easing: easeOutCubic }),
        );
        fireFlicker.value = withRepeat(
          withSequence(
            withTiming(0.68, { duration: 420, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.48, { duration: 480, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
      }, igniteAt),
    );

    const travelAt = igniteAt + IGNITE_TO_A_MS + IGNITE_TO_B_MS + FIRE_HOLD_MS;
    timers.push(
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(measureAndTravel);
        });
      }, travelAt),
    );

    const landAt = travelAt + TRAVEL_MS;
    timers.push(
      setTimeout(() => {
        runLandAndReveal();
      }, landAt),
    );

    timers.push(
      setTimeout(() => {
        headlineOpacity.value = withTiming(1, { duration: HEADLINE_FADE_MS, easing: easeOutCubic });
      }, landAt + HEADLINE_DELAY_MS),
    );

    timers.push(
      setTimeout(() => {
        subOpacity.value = withTiming(1, { duration: SUB_FADE_MS, easing: easeOutCubic });
      }, landAt + HEADLINE_DELAY_MS + SUB_DELAY_MS),
    );

    const advanceAt = landAt + HEADLINE_DELAY_MS + SUB_DELAY_MS + SUB_FADE_MS + AFTER_SUB_ADVANCE_MS;
    timers.push(setTimeout(() => commitAdvance(), advanceAt));

    return () => {
      timers.forEach(clearTimeout);
    };
    // Handoff runs once when count reaches TARGET; shared values are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- orchestration timers only
  }, [count, commitAdvance, measureAndTravel, runLandAndReveal]);

  const floatWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + haloPulse.value * 0.32 + completionPulse.value * 0.14,
    transform: [{ scale: 1 + haloPulse.value * 0.012 + completionPulse.value * 0.018 }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const pressScale = 1 - pressed.value * 0.012;
    const completionLift = completionPulse.value * 0.012;
    return {
      transform: [{ scale: (scale.value + completionLift) * pressScale }],
      shadowOpacity:
        0.12 + glow.value * 0.14 + tapEmphasis.value * 0.08 + completionPulse.value * 0.12,
      shadowRadius: 18 + glow.value * 10 + tapEmphasis.value * 6 + completionPulse.value * 14,
      borderColor: `rgba(245,200,66,${0.22 + glow.value * 0.18 + tapEmphasis.value * 0.1 + completionPulse.value * 0.12})`,
    };
  });

  const counterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + tapEmphasis.value * 0.2 + completionPulse.value * 0.18,
    transform: [{ scale: 1 + tapEmphasis.value * 0.045 + completionPulse.value * 0.06 }],
  }));

  const dhikrShellStyle = useAnimatedStyle(() => ({
    opacity: dhikrShellOpacity.value,
  }));

  const streakShellStyle = useAnimatedStyle(() => ({
    opacity: streakShellOpacity.value,
  }));

  const transitionDimStyle = useAnimatedStyle(() => ({
    opacity: transitionDimOpacity.value * TRANSITION_DIM_PEAK,
  }));

  const fireOrbPositionStyle = useAnimatedStyle(() => ({
    opacity: fireOverlayOpacity.value,
    transform: [{ translateX: fireTx.value }, { translateY: fireTy.value }],
  }));

  const fireOrbCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const fireBloomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.42 + fireFlicker.value * 0.28,
    transform: [{ scale: fireBloomScale.value }],
  }));

  const fireRingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fireRingOpacity.value * (0.55 + fireFlicker.value * 0.35),
    transform: [{ scale: fireRingScale.value }],
  }));

  const day1GlowStyle = useAnimatedStyle(() => ({
    opacity: day1Halo.value * 0.62,
    transform: [{ scale: 0.88 + day1Halo.value * 0.24 }],
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
  }));

  const day1RowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + landed.value * (day1Scale.value - 1) }],
  }));

  const innerFireStyle = useAnimatedStyle(() => ({
    opacity: innerFireOpacity.value,
  }));

  const day1InactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - landed.value,
  }));

  const day1ActiveShellStyle = useAnimatedStyle(() => ({
    opacity: landed.value,
  }));

  const handleTap = useCallback(() => {
    setCount((c) => {
      if (c >= TARGET) return c;
      return c + 1;
    });
  }, []);

  const complete = count >= TARGET;

  return (
    <View ref={rootRef} style={local.stepRoot} onLayout={onRootLayout}>
      <Animated.View
        pointerEvents="none"
        style={[local.streakUnderlay, streakShellStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.Text style={[styles.stepTitle, local.streakTitle, headlineStyle]}>
          Streak preview ✨
        </Animated.Text>

        <View style={styles.streakPreview}>
          {ONBOARDING_STREAK_WEEKDAY_LABELS.map((d, i) => {
            const isFirst = i === 0;
            if (isFirst) {
              return (
                <View key={i} ref={day1Ref} collapsable={false} style={styles.streakDay1Wrap}>
                  <Animated.View style={[local.day1Cell, day1RowStyle]}>
                    <Animated.View pointerEvents="none" style={[local.day1GlowDisk, day1GlowStyle]} />
                    <Animated.View style={[local.day1Layer, day1InactiveStyle]}>
                      <View style={[styles.streakDay, styles.streakDayInactive]}>
                        <Text style={[styles.streakDayLabel, { color: "#9b80c8" }]}>{d}</Text>
                      </View>
                    </Animated.View>
                    <Animated.View style={[local.day1Layer, day1ActiveShellStyle]} pointerEvents="none">
                      <View style={[styles.streakDay, styles.streakDayActive, { overflow: "hidden" }]}>
                        <View style={styles.streakDay1Inner}>
                          <Animated.Text style={[styles.streakDayFire, innerFireStyle]} accessibilityElementsHidden>
                            🔥
                          </Animated.Text>
                          <Text style={[styles.streakDayLabel, { color: "#1a0a2e" }]}>{d}</Text>
                        </View>
                      </View>
                    </Animated.View>
                  </Animated.View>
                </View>
              );
            }
            return (
              <View key={i} style={[styles.streakDay, styles.streakDayInactive]}>
                <Text style={[styles.streakDayLabel, { color: "#9b80c8" }]}>{d}</Text>
              </View>
            );
          })}
        </View>

        <Animated.Text style={[styles.stepSub, local.streakSub, subStyle]}>
          Your streak starts when you finish a real session after onboarding.
        </Animated.Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[local.transitionDimLayer, transitionDimStyle]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      <Animated.View style={[local.dhikrLayer, dhikrShellStyle]}>
        <View style={local.dhikrHeaderBlock}>
          <Ionicons name="book-outline" size={60} color="#C4A2F7" style={local.bookIcon} />
          <Text style={[styles.stepTitle, local.dhikrTitle]}>{"Let's begin your first dhikr"}</Text>
        </View>
        <Pressable
          style={local.dhikrMiddle}
          disabled={complete}
          onPress={handleTap}
          onPressIn={() => {
            if (complete) return;
            pressed.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.cubic) });
          }}
          onPressOut={() => {
            pressed.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
          }}
          accessibilityRole="button"
          accessibilityLabel="Tap once for each recitation of Alhamdulillah, up to ten times"
          accessibilityState={{ disabled: complete }}
        >
          <View style={local.dhikrCardHintStack}>
            <View style={local.cardStage}>
              <Animated.View pointerEvents="none" style={[local.glowHalo, haloAnimatedStyle]} />
              <Animated.View pointerEvents="none" style={[local.floatWrap, floatWrapStyle]}>
                <View style={local.cardPressable}>
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
                </View>
              </Animated.View>
            </View>
            {complete ? (
              <Animated.Text
                entering={FadeIn.duration(520).easing(Easing.out(Easing.cubic))}
                style={local.completionLine}
              >
                Beautiful. Intro dhikr complete.
              </Animated.Text>
            ) : (
              <Text style={[styles.stepSub, local.tapHint]}>Tap anywhere to count your dhikr</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>

      <View style={local.fireStage} pointerEvents="none">
        <Animated.View style={[local.fireOrbWrap, fireOrbPositionStyle]}>
          <Animated.View style={[local.fireOrbCore, fireOrbCoreStyle]}>
            <Animated.View style={[local.fireBloom, fireBloomAnimatedStyle]} />
            <Animated.View style={[local.fireRing, fireRingAnimatedStyle]} />
            <Text style={local.fireEmoji} accessibilityElementsHidden>
              🔥
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  stepRoot: {
    flex: 1,
    minHeight: 420,
    width: "100%",
    alignSelf: "stretch",
    position: "relative",
  },
  streakUnderlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 64,
  },
  transitionDimLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: "rgba(6,4,16,1)",
  },
  streakTitle: {
    textAlign: "center",
    marginBottom: 4,
  },
  streakSub: {
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  day1Cell: {
    width: ONBOARDING_STREAK_DAY_CELL_SIZE,
    height: ONBOARDING_STREAK_DAY_CELL_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  day1GlowDisk: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -34,
    marginTop: -34,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(196,162,247,0.35)",
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.28)",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  day1Layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  dhikrLayer: {
    zIndex: 2,
    flex: 1,
    width: "100%",
    minHeight: 0,
    justifyContent: "flex-start",
    paddingBottom: 6,
  },
  dhikrHeaderBlock: {
    alignItems: "center",
    width: "100%",
    gap: 11,
  },
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
    gap: 36,
    marginTop: -12,
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
  fireStage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fireOrbWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  fireOrbCore: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    minHeight: 120,
  },
  fireBloom: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(184,148,245,0.2)",
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.24)",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  fireRing: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1.5,
    borderColor: "rgba(196,162,247,0.38)",
    backgroundColor: "transparent",
  },
  fireEmoji: {
    fontSize: 54,
    lineHeight: 60,
    textShadowColor: "rgba(196,162,247,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
});
