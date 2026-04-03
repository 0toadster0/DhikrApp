import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, type AnimatedStyle } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { ViewStyle } from "react-native";

import { ONBOARDING_AGE_RANGES } from "@/constants/onboarding/content";
import { useColors } from "@/hooks/useColors";

import { styles } from "../onboardingStyles";

export function OnboardingAgeRangeStep({
  ageRange,
  onSelectAgeRange,
  showAgeRangeHint,
  goalsMultiSelectShakeStyle,
}: {
  ageRange: string | null;
  onSelectAgeRange: (value: string | null) => void;
  showAgeRangeHint: boolean;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
}) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.goalsReflectStep}>
      <View style={styles.goalsReflectTitleBlock}>
        <Text style={styles.goalsStepTitle}>How old are you?</Text>
      </View>
      {showAgeRangeHint ? (
        <Text style={[styles.goalsPickValidationHint, styles.ageRangeValidationHint]}>
          Select an option to continue
        </Text>
      ) : null}
      <Animated.View
        style={[
          styles.ageRangeShakeBlock,
          { marginTop: showAgeRangeHint ? 10 : 40 },
          goalsMultiSelectShakeStyle,
        ]}
      >
        <View style={styles.ageRangeStack}>
          {ONBOARDING_AGE_RANGES.map((opt) => {
            const selected = ageRange === opt.id;
            const gradientColors = selected
              ? (["rgba(255,255,255,0.07)", "rgba(196,162,247,0.12)", "rgba(38,26,66,0.62)"] as const)
              : (["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)", "rgba(45,26,74,0.5)"] as const);

            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onSelectAgeRange(selected ? null : opt.id);
                }}
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
                    style={styles.ageRangeOptionGradient}
                  >
                    <Text
                      style={[
                        styles.ageRangeOptionLabel,
                        { color: selected ? colors.foreground : colors.mutedForeground },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </LinearGradient>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Animated.View>
  );
}
