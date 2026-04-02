import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "gold";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ label, onPress, style, loading, disabled, variant = "primary" }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 90, easing: Easing.out(Easing.cubic) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) });
  };

  if (variant === "ghost") {
    return (
      <AnimatedPressable
        style={[styles.ghostButton, style, animatedStyle, disabled && styles.disabled]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={[styles.ghostLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </AnimatedPressable>
    );
  }

  const gradientColors: [string, string] = variant === "gold"
    ? ["#E8B84B", "#F5C842"]
    : ["#9B6FE8", "#C4A2F7"];

  const shadowStyle =
    variant === "gold"
      ? styles.shadowGold
      : styles.shadowPrimary;

  return (
    <AnimatedPressable
      style={[
        styles.wrapper,
        shadowStyle,
        style,
        animatedStyle,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.innerClip}>
        <LinearGradient
          colors={gradientColors}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={variant === "gold" ? "#1a0a2e" : "#1a0a2e"} />
          ) : (
            <Text style={[styles.label, { color: "#1a0a2e" }]}>{label}</Text>
          )}
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 6,
  },
  innerClip: {
    borderRadius: 28,
    overflow: "hidden",
  },
  shadowPrimary: {
    shadowColor: "#B894F0",
    shadowOpacity: 0.28,
  },
  shadowGold: {
    shadowColor: "#E8B84B",
    shadowOpacity: 0.22,
  },
  button: {
    paddingVertical: 17,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  ghostButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ghostLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  disabled: {
    opacity: 0.5,
  },
});
