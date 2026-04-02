import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

const APPS = [
  { id: "instagram", icon: "logo-instagram", label: "Instagram", brandColor: "#E1306C" },
  { id: "tiktok", icon: "logo-tiktok", label: "TikTok", brandColor: "#00F2EA" },
  { id: "snapchat", icon: "logo-snapchat", label: "Snapchat", brandColor: "#FFFC00" },
  { id: "twitter", icon: "logo-twitter", label: "X / Twitter", brandColor: "#1DA1F2" },
];

export function OnboardingStep3({
  onContinue,
  progressCurrent = 2,
  progressTotal = 17,
}: Props) {
  const pulse = useSharedValue(0);

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
              <View style={styles.appCardOverlay} pointerEvents="none" />
              <Ionicons name={app.icon as any} size={28} color={app.brandColor} style={styles.appIcon} />
              <View style={[styles.lockBadge, { borderColor: "rgba(196,162,247,0.18)" }]} pointerEvents="none">
                <Ionicons name="lock-closed-outline" size={14} color={app.brandColor} />
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
          <ProgressDots total={progressTotal} current={progressCurrent} variant="thin" />
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
    paddingTop: 8,
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  top: {
    alignItems: "center",
    gap: 14,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 240,
  },
  appCard: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "rgba(45,26,74,0.55)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.14)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  appCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  appIcon: {
    opacity: 0.84,
  },
  lockBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
    borderWidth: 1,
    opacity: 1,
  },
  copyWrap: {
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 6,
  },
  line1: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 27,
    letterSpacing: -0.2,
  },
  line2: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(196,162,247,0.78)",
    textAlign: "center",
    lineHeight: 19,
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
    gap: 10,
    paddingBottom: 2,
  },
  progressWrap: {
    width: "100%",
    alignItems: "center",
  },
});

