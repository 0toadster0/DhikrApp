import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";

import { styles } from "./onboardingStyles";

export function GoalsSelectRow({
  label,
  sub,
  selected,
  onPress,
  /** Tighter padding, top-aligned check, smaller type — for multi-line option copy. */
  compact = false,
}: {
  label: string;
  /** Optional second line; same typography as struggle / ritual subs elsewhere. */
  sub?: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const colors = useColors();
  const checkProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    checkProgress.value = withTiming(selected ? 1 : 0, {
      duration: 195,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected, checkProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(checkProgress.value, [0, 1], [0.5, 1], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(checkProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: interpolate(checkProgress.value, [0, 0.4, 1], [0, 0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(checkProgress.value, [0, 1], [0.82, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const gradientColors = selected
    ? (["rgba(255,255,255,0.07)", "rgba(196,162,247,0.085)", "rgba(38,26,66,0.58)"] as const)
    : (["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)", "rgba(45,26,74,0.5)"] as const);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.goalsPickPressable,
        selected && styles.goalsPickPressableSelected,
        {
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.986 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.goalsPickOuter,
          {
            borderColor: selected ? "rgba(196,162,247,0.58)" : colors.border,
            borderWidth: selected ? 1.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={[gradientColors[0], gradientColors[1], gradientColors[2]]}
          locations={[0, 0.42, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.goalsPickGradient, compact && styles.goalsPickGradientCompact]}
        >
          <View style={[styles.goalsPickRow, compact && styles.goalsPickRowTopAlign]}>
            <View style={[styles.goalsCheckRing, compact && styles.goalsCheckRingTopAlign]}>
              <Animated.View
                style={[styles.goalsCheckFill, fillStyle, { backgroundColor: colors.primary }]}
              />
              <Animated.View style={[styles.goalsCheckMarkWrap, markStyle]} pointerEvents="none">
                <Ionicons name="checkmark" size={14} color="#1a0a2e" />
              </Animated.View>
            </View>
            <View style={styles.goalsPickLabelCol}>
              <Text
                style={[
                  styles.goalLabel,
                  compact && styles.goalLabelCompact,
                  { flex: 0, color: selected ? colors.foreground : colors.mutedForeground },
                ]}
              >
                {label}
              </Text>
              {sub ? <Text style={styles.ritualSub}>{sub}</Text> : null}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
