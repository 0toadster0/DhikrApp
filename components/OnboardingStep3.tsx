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

const IG_LOGO = require("@/assets/images/onboarding-apps/instagram-updated.png");
const TT_LOGO = require("@/assets/images/onboarding-apps/tiktok-updated.png");
const SNAPCHAT_LOGO = require("@/assets/images/onboarding-apps/snapchat-updated.png");
const X_LOGO = require("@/assets/images/onboarding-apps/x-updated.png");

type LockAppId = "instagram" | "tiktok" | "snapchat" | "x";

const APP_ICON_RENDER_SIZE = 52;

const APPS: Array<{ id: LockAppId; label: string; source: unknown }> = [
  { id: "instagram", label: "Instagram", source: IG_LOGO },
  { id: "tiktok", label: "TikTok", source: TT_LOGO },
  { id: "snapchat", label: "Snapchat", source: SNAPCHAT_LOGO },
  { id: "x", label: "X", source: X_LOGO },
];

export function OnboardingStep3({
  onContinue,
  progressCurrent = 2,
  progressTotal = 18,
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
      <View style={styles.contentWrapper}>
        <View style={styles.contentStack}>
          <View style={styles.iconGrid}>
            <View style={styles.iconRow}>
              {APPS.slice(0, 2).map((app) => (
                <View key={app.id} style={styles.appCard} accessibilityLabel={`${app.label} (locked)`}>
                  <View style={styles.appIconClip} pointerEvents="none">
                    <Image
                      source={app.source as ImageSourcePropType}
                      style={[
                        styles.appIconImage,
                        {
                          width: APP_ICON_RENDER_SIZE,
                          height: APP_ICON_RENDER_SIZE,
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.lockBadge} pointerEvents="none">
                    <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.iconRow}>
              {APPS.slice(2, 4).map((app) => (
                <View key={app.id} style={styles.appCard} accessibilityLabel={`${app.label} (locked)`}>
                  <View style={styles.appIconClip} pointerEvents="none">
                    <Image
                      source={app.source as ImageSourcePropType}
                      style={[
                        styles.appIconImage,
                        {
                          width: APP_ICON_RENDER_SIZE,
                          height: APP_ICON_RENDER_SIZE,
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.lockBadge} pointerEvents="none">
                    <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.copyWrap}>
            <Text style={styles.line1}>Lock distracting apps</Text>
          </View>
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
    paddingTop: 0,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentStack: {
    alignItems: "center",
    gap: 22,
  },
  iconGrid: {
    flexDirection: "column",
    gap: 22,
    width: 164,
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
  },
  appCard: {
    width: 82,
    height: 82,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  appIconClip: {
    width: 60,
    height: 60,
    borderRadius: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  appIconImage: {
    opacity: 1,
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 3,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
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

