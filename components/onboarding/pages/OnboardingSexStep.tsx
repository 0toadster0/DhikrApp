import React from "react";
import { Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, type AnimatedStyle } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ONBOARDING_SEX_OPTIONS } from "@/constants/onboarding/content";
import { useColors } from "@/hooks/useColors";

import { styles } from "../onboardingStyles";

/** Header row under safe top (matches onboarding screen + OnboardingScreenHeader). */
const HEADER_ROW = 58;
/** Continue + progress dots + spacing above home indicator. */
const FOOTER_CHROME = 116;

export function OnboardingSexStep({
  sex,
  onSelectSex,
  showSexHint,
  goalsMultiSelectShakeStyle,
}: {
  sex: string | null;
  onSelectSex: (value: string | null) => void;
  showSexHint: boolean;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const belowHeader = topPadding + HEADER_ROW;
  const visibleBodyH = Math.max(340, windowHeight - belowHeader - bottomPadding - FOOTER_CHROME);

  /** Space from step top to middle of option stack (title + optional hint). */
  const titleBand = showSexHint ? 162 : 120;
  /** Half of three option rows + gaps (~14*2 + 24 per row, gap 10). */
  const optionsHalf = 102;
  const optionsPadTop = Math.max(0, Math.round(visibleBodyH / 2 - titleBand - optionsHalf));

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.goalsReflectStep, { minHeight: visibleBodyH, alignSelf: "stretch" }]}
    >
      <View style={styles.goalsReflectTitleBlock}>
        <Text style={styles.goalsStepTitle}>{"Final question, what's your sex?"}</Text>
      </View>
      {showSexHint ? (
        <Text style={[styles.goalsPickValidationHint, styles.ageRangeValidationHint]}>
          Select an option to continue
        </Text>
      ) : null}
      <View style={{ width: "100%", alignItems: "center", paddingTop: optionsPadTop }}>
        <Animated.View
          style={[
            styles.ageRangeShakeBlock,
            { marginTop: showSexHint ? 10 : 0, paddingTop: 0 },
            goalsMultiSelectShakeStyle,
          ]}
        >
          <View style={styles.ageRangeStack}>
            {ONBOARDING_SEX_OPTIONS.map((opt) => {
              const selected = sex === opt.id;
              const gradientColors = selected
                ? (["rgba(255,255,255,0.07)", "rgba(196,162,247,0.12)", "rgba(38,26,66,0.62)"] as const)
                : (["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)", "rgba(45,26,74,0.5)"] as const);

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onSelectSex(selected ? null : opt.id);
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
      </View>
    </Animated.View>
  );
}
