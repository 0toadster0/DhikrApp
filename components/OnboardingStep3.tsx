import React, { useEffect } from "react";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ProgressDots } from "./ProgressDots";

type Props = {
  onContinue?: () => void;
  progressCurrent?: number;
  progressTotal?: number;
};

const IG_LOGO = require("@/assets/images/onboarding-apps/IG-logo.png");
const TT_LOGO = require("@/assets/images/onboarding-apps/TT-logo.png");
const SNAPCHAT_LOGO = require("@/assets/images/onboarding-apps/Snapchat-logo.png");
const X_LOGO = require("@/assets/images/onboarding-apps/X-logo.png");

const APPS = [
  { id: "instagram", label: "Instagram", source: IG_LOGO, imageScale: 1.18, imageOffsetY: -2 },
  { id: "tiktok", label: "TikTok", source: TT_LOGO, imageScale: 1.08, imageOffsetY: 0 },
  { id: "snapchat", label: "Snapchat", source: SNAPCHAT_LOGO, imageScale: 1.35, imageOffsetY: 0 },
  { id: "x", label: "X", source: X_LOGO, imageScale: 1.08, imageOffsetY: 0 },
];

export function OnboardingStep3({
  onContinue,
  progressCurrent = 2,
  progressTotal = 17,
}: Props) {
  const pulse = useSharedValue(0);
  const progressValue = Math.max(0, Math.min(1, (progressCurrent + 1) / progressTotal));

  useEffect(() => {
    // Gentle, non-distracting arrow pulse.
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.52 + 0.28 * pulse.value,
    transform: [{ translateY: -1.5 * pulse.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.container}>
      <View style={styles.top}>
        <View style={styles.iconGrid}>
          {APPS.map((app) => (
            <View key={app.id} style={styles.appCard} accessibilityLabel={`${app.label} (locked)`}>
              <View style={styles.appIconClip} pointerEvents="none">
                <Image
                  source={app.source as ImageSourcePropType}
                  style={[
                    styles.appIconImage,
                    {
                      transform: [{ scale: app.imageScale }, { translateY: app.imageOffsetY }],
                    },
                  ]}
                  resizeMode="cover"
                />
                <View style={styles.appCardOverlay} />
              </View>
              <View style={styles.lockBadge} pointerEvents="none">
                <Ionicons name="lock-closed" size={12} color="rgba(235,225,255,0.85)" />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.copyWrap}>
          <Text style={styles.line1}>Lock distracting apps</Text>
          <Text style={styles.line2}>Instagram, TikTok, Snapchat & X</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          disabled={!onContinue}
          hitSlop={12}
          style={styles.arrowPress}
        >
          <Animated.View style={[styles.arrowInner, arrowStyle]}>
            <Ionicons name="chevron-down" size={26} color="rgba(240,234,255,0.58)" />
          </Animated.View>
        </Pressable>

        <View style={styles.progressWrap} pointerEvents="none">
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressValue * 100}%` }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  top: {
    alignItems: "center",
    gap: 10,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    width: 232,
  },
  appCard: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: "rgba(45,26,74,0.42)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 10,
    overflow: "hidden",
  },
  appIconClip: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16,8,28,0.62)",
  },
  appCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,2,12,0.26)",
  },
  appIconImage: {
    width: "100%",
    height: "100%",
    opacity: 0.82,
  },
  lockBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(12,6,23,0.62)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.2)",
  },
  copyWrap: {
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 4,
  },
  line1: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 25,
    letterSpacing: -0.15,
  },
  line2: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(196,162,247,0.72)",
    textAlign: "center",
    lineHeight: 20,
  },
  arrowPress: {
    marginBottom: 0,
  },
  arrowInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  bottom: {
    width: "100%",
    alignItems: "center",
    gap: 7,
    paddingBottom: 0,
  },
  progressWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  progressTrack: {
    width: "78%",
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(196,162,247,0.14)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(235,226,255,0.5)",
  },
});

