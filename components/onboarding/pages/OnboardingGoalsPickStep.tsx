import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, type AnimatedStyle, type ScrollHandlerProcessed, type SharedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { TextStyle, ViewStyle } from "react-native";

import { GOALS, type OnboardingPickOption } from "@/constants/onboarding/content";
import type { MascotKey } from "@/constants/mascots";

import { GoalsReflectionMascot } from "../GoalsReflectionMascot";
import { GoalsSelectRow } from "../GoalsSelectRow";
import { GoalsAnimatedScrollView } from "../shared/GoalsAnimatedScrollView";
import { styles } from "../onboardingStyles";

export function OnboardingGoalsPickStep({
  showGoalsPickHint,
  goalsMultiSelectShakeStyle,
  goalsPickListViewportMaxHeight,
  goalsScrollHandler,
  goalsScrollViewportH,
  goalsScrollContentH,
  bumpGoalsScrollHint,
  onFirstGoalsRowLayout,
  selectedGoals,
  onToggleGoal,
  goalsScrollRailStyle,
  goalsScrollThumbStyle,
  options = GOALS,
  titleLine1 = "What are you",
  titleLine2 = "hoping to change?",
  titleLine3,
  titleLine3Emphasis,
  introEmphasisColor,
  titleStyle,
  mascotKey = "mag",
}: {
  showGoalsPickHint: boolean;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
  goalsPickListViewportMaxHeight: number;
  goalsScrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
  goalsScrollViewportH: SharedValue<number>;
  goalsScrollContentH: SharedValue<number>;
  bumpGoalsScrollHint: () => void;
  onFirstGoalsRowLayout: (e: { nativeEvent: { layout: { height: number } } }) => void;
  selectedGoals: string[];
  onToggleGoal: (id: string) => void;
  goalsScrollRailStyle: AnimatedStyle<ViewStyle>;
  goalsScrollThumbStyle: AnimatedStyle<ViewStyle>;
  options?: OnboardingPickOption[];
  titleLine1?: string;
  titleLine2?: string;
  /** When set, title becomes three lines (line1 / line2 / line3) to control wrapping. */
  titleLine3?: string;
  /** When set with `introEmphasisColor`, third line renders `before` + emphasized + `after` instead of `titleLine3`. */
  titleLine3Emphasis?: { before: string; emphasis: string; after: string };
  introEmphasisColor?: string;
  /** Merged after `goalsStepTitle` (e.g. wider layout so manual lines don’t wrap again). */
  titleStyle?: TextStyle;
  mascotKey?: MascotKey;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.goalsReflectStep}>
      <View style={styles.goalsReflectTitleBlock}>
        <Text style={[styles.goalsStepTitle, titleStyle]}>
          {titleLine1}
          {"\n"}
          {titleLine2}
          {titleLine3Emphasis != null && introEmphasisColor != null ? (
            <>
              {"\n"}
              {titleLine3Emphasis.before}
              <Text style={{ color: introEmphasisColor }}>{titleLine3Emphasis.emphasis}</Text>
              {titleLine3Emphasis.after}
            </>
          ) : titleLine3 != null ? (
            <>
              {"\n"}
              {titleLine3}
            </>
          ) : null}
        </Text>
      </View>
      <View style={styles.goalsReflectSubRow}>
        <GoalsReflectionMascot mascotKey={mascotKey} />
        <Text style={styles.goalsStepSub}>Choose all that resonate.</Text>
      </View>
      {showGoalsPickHint ? (
        <Text style={styles.goalsPickValidationHint}>Please select at least one option</Text>
      ) : null}
      <Animated.View style={[styles.goalsListScrollRow, goalsMultiSelectShakeStyle]}>
        <View style={styles.goalsListScrollListCol}>
          <GoalsAnimatedScrollView
            style={[styles.goalsListScrollViewport, { maxHeight: goalsPickListViewportMaxHeight }]}
            contentContainerStyle={styles.goalsListScrollContent}
            showsVerticalScrollIndicator={false}
            bounces
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={goalsScrollHandler}
            onLayout={(e) => {
              goalsScrollViewportH.value = e.nativeEvent.layout.height;
            }}
            onContentSizeChange={(_, h) => {
              goalsScrollContentH.value = h;
            }}
            onScrollBeginDrag={bumpGoalsScrollHint}
            onScrollEndDrag={bumpGoalsScrollHint}
            onMomentumScrollEnd={bumpGoalsScrollHint}
          >
            {options.map((g, index) => (
              <View
                key={g.id}
                style={styles.goalsListRowMeasureWrap}
                onLayout={index === 0 ? onFirstGoalsRowLayout : undefined}
              >
                <GoalsSelectRow
                  label={g.label}
                  selected={selectedGoals.includes(g.id)}
                  onPress={() => onToggleGoal(g.id)}
                />
              </View>
            ))}
          </GoalsAnimatedScrollView>
          <LinearGradient
            pointerEvents="none"
            colors={["transparent", "rgba(26,10,46,0.42)"]}
            locations={[0.35, 1]}
            style={styles.goalsScrollBottomFade}
          />
        </View>
        <Animated.View pointerEvents="none" style={[styles.goalsScrollRail, goalsScrollRailStyle]}>
          <View style={styles.goalsScrollTrack}>
            <Animated.View style={[styles.goalsScrollThumb, goalsScrollThumbStyle]} />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
