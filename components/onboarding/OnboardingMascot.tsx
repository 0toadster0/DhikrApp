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

export function PremiumOnboardingArt() {
  return <OnboardingMascot variant="hero" size="large" />;
}

export function OnboardingMascot({
  variant,
  float = false,
  size = "medium",
}: {
  variant: "hero" | "tasbeeh" | "mag";
  float?: boolean;
  size?: "medium" | "large";
}) {
  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.56, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [floatY, glowOpacity, glowScale]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float ? floatY.value : 0 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const stageStyle = size === "large" ? styles.artStage : styles.mascotStage;
  const glowBaseStyle = size === "large" ? styles.artGlow : styles.mascotGlow;
  const surfaceStyle = size === "large" ? styles.artSurface : styles.mascotSurface;
  const imageStyle =
    variant === "hero"
      ? size === "large"
        ? styles.heroMascotLarge
        : styles.heroMascotMedium
      : size === "large"
        ? styles.framedMascotLarge
        : styles.framedMascotMedium;

  return (
    <View style={stageStyle}>
      <Animated.View pointerEvents="none" style={[glowBaseStyle, glowStyle]} />
      <Animated.View style={[styles.artFloatLayer, floatStyle]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(196,162,247,0.03)"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={surfaceStyle}
        >
          <Image source={mascots[variant]} style={imageStyle} resizeMode="cover" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
