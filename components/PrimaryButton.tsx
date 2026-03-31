import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
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

  return (
    <AnimatedPressable
      style={[styles.wrapper, style, animatedStyle, (disabled || loading) && styles.disabled]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    overflow: "hidden",
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
