import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { NormalizedLockAppIcon } from "@/components/NormalizedLockAppIcon";
import {
  APP_LOCK_APPS,
  APP_LOCK_ICON_CLIP,
  APP_LOCK_ICON_CLIP_RADIUS,
  APP_LOCK_ICON_IMAGE,
} from "@/constants/onboarding/appLock";

import { styles } from "./onboardingStyles";

export function AppLockStep({
  onContinue,
  progressCurrent = 2,
  progressTotal = 18,
}: {
  onContinue?: () => void;
  progressCurrent?: number;
  progressTotal?: number;
}) {
  const pulse = useSharedValue(0);
  const cardFloat1 = useSharedValue(0);
  const cardFloat2 = useSharedValue(0);
  const cardFloat3 = useSharedValue(0);
  const cardFloat4 = useSharedValue(0);
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

    // Very subtle staggered drift for a calmer, premium feel.
    cardFloat1.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(-1.8, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat2.value = withDelay(
      280,
      withRepeat(
        withSequence(
          withTiming(-2.2, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat3.value = withDelay(
      520,
      withRepeat(
        withSequence(
          withTiming(-1.6, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat4.value = withDelay(
      760,
      withRepeat(
        withSequence(
          withTiming(-2, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [pulse, cardFloat1, cardFloat2, cardFloat3, cardFloat4]);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.2 * pulse.value,
    transform: [{ translateY: -0.95 * pulse.value }],
  }));
  const cardFloatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat1.value }],
  }));
  const cardFloatStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat2.value }],
  }));
  const cardFloatStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat3.value }],
  }));
  const cardFloatStyle4 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat4.value }],
  }));
  const cardFloatStyles = [cardFloatStyle1, cardFloatStyle2, cardFloatStyle3, cardFloatStyle4];

  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.appLockContainer}>
      <View style={styles.contentWrapper}>
        <View style={styles.goalsReflectTitleBlock}>
          <Text style={styles.appLockHeadline}>
            {
              "It's simple, we lock distracting apps until you do a quick dhikr or dua"
            }
          </Text>
        </View>

        <View style={styles.appLockIconsSubtitleCenter}>
          <View style={styles.appLockIconsSubtitleStack}>
            <View style={styles.appLockIconGrid}>
              <View style={styles.appLockIconRow}>
                {APP_LOCK_APPS.slice(0, 2).map((app, index) => (
                  <Animated.View
                    key={app.id}
                    style={[styles.appLockCard, cardFloatStyles[index]]}
                    accessibilityLabel={`${app.label} (locked)`}
                  >
                    <View style={styles.appLockCardScaledShell} pointerEvents="none">
                      <View style={styles.appLockCardGlow} pointerEvents="none" />
                    </View>
                    <View style={styles.appLockIconLayer} pointerEvents="none">
                      <NormalizedLockAppIcon
                        id={app.id}
                        clipSize={APP_LOCK_ICON_CLIP}
                        clipBorderRadius={APP_LOCK_ICON_CLIP_RADIUS}
                        imageBaseSize={APP_LOCK_ICON_IMAGE}
                      />
                    </View>
                    <View style={styles.appLockLockBadge} pointerEvents="none">
                      <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                    </View>
                  </Animated.View>
                ))}
              </View>

              <View style={styles.appLockIconRow}>
                {APP_LOCK_APPS.slice(2, 4).map((app, index) => (
                  <Animated.View
                    key={app.id}
                    style={[styles.appLockCard, cardFloatStyles[index + 2]]}
                    accessibilityLabel={`${app.label} (locked)`}
                  >
                    <View style={styles.appLockCardScaledShell} pointerEvents="none">
                      <View style={styles.appLockCardGlow} pointerEvents="none" />
                    </View>
                    <View style={styles.appLockIconLayer} pointerEvents="none">
                      <NormalizedLockAppIcon
                        id={app.id}
                        clipSize={APP_LOCK_ICON_CLIP}
                        clipBorderRadius={APP_LOCK_ICON_CLIP_RADIUS}
                        imageBaseSize={APP_LOCK_ICON_IMAGE}
                      />
                    </View>
                    <View style={styles.appLockLockBadge} pointerEvents="none">
                      <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            <View style={styles.appLockCopyWrap}>
              <Text style={styles.appLockSubline}>your choice, done in 30 seconds or less</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.appLockBottom}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          disabled={!onContinue}
          hitSlop={12}
          style={styles.appLockArrowPress}
        >
          <Animated.View style={[styles.appLockArrowInner, arrowStyle]}>
            <Ionicons name="chevron-down" size={32} color="rgba(240,234,255,0.64)" />
          </Animated.View>
        </Pressable>

        <View style={styles.appLockProgressWrap} pointerEvents="none">
          <View style={styles.appLockProgressTrack}>
            <View style={[styles.appLockProgressFill, { width: `${progressValue * 100}%` }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
