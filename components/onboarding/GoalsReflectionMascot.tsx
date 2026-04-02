import React, { useEffect } from "react";
import { Image, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { mascots } from "@/constants/mascots";

import { styles } from "./onboardingStyles";

/** Compact mag mascot for goals step (screen 7): soft float + glow, same pattern as OnboardingMascot. */
export function GoalsReflectionMascot() {
  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.52);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-3.5, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.74, { duration: 2100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.48, { duration: 2100, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [floatY, glowOpacity, glowScale]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { rotate: "6deg" }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ rotate: "6deg" }, { scale: glowScale.value }],
  }));

  return (
    <View style={styles.goalsMascotStage} accessible={false}>
      <Animated.View pointerEvents="none" style={[styles.goalsMascotGlow, glowStyle]} />
      <Animated.View style={[styles.artFloatLayer, floatStyle]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(196,162,247,0.03)"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.goalsMascotSurface}
        >
          <Image source={mascots.mag} style={styles.goalsMascotImg} resizeMode="cover" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
