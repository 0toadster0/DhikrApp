import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, type AnimatedStyle, type ScrollHandlerProcessed, type SharedValue } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { ViewStyle } from "react-native";

import { STRUGGLE_TIMES } from "@/constants/onboarding/content";

import { GoalsSelectRow } from "../GoalsSelectRow";
import { GoalsAnimatedScrollView } from "../shared/GoalsAnimatedScrollView";
import { styles } from "../onboardingStyles";

export function OnboardingRelationshipGoalsStep({
  showRelationshipPickHint,
  goalsMultiSelectShakeStyle,
  goalsListViewportMaxHeight,
  goalsScrollHandler,
  goalsScrollViewportH,
  goalsScrollContentH,
  bumpGoalsScrollHint,
  onFirstGoalsRowLayout,
  selectedTimes,
  onToggleTime,
  goalsScrollRailStyle,
  goalsScrollThumbStyle,
}: {
  showRelationshipPickHint: boolean;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
  goalsListViewportMaxHeight: number;
  goalsScrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
  goalsScrollViewportH: SharedValue<number>;
  goalsScrollContentH: SharedValue<number>;
  bumpGoalsScrollHint: () => void;
  onFirstGoalsRowLayout: (e: { nativeEvent: { layout: { height: number } } }) => void;
  selectedTimes: string[];
  onToggleTime: (id: string) => void;
  goalsScrollRailStyle: AnimatedStyle<ViewStyle>;
  goalsScrollThumbStyle: AnimatedStyle<ViewStyle>;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.goalsReflectStep}>
      <View style={styles.goalsReflectTitleBlock}>
        <Text style={[styles.goalsStepTitle, styles.goalsRelationshipTitle]}>
          What does a strong relationship with Allah look like to you?
        </Text>
      </View>
      <View style={[styles.goalsReflectSubBlockCentered, styles.goalsReflectSubRelationship]}>
        <Text style={[styles.goalsStepSubCentered, styles.goalsRelationshipSub]}>Choose all that resonate</Text>
      </View>
      {showRelationshipPickHint ? (
        <Text style={[styles.goalsPickValidationHint, styles.goalsRelationshipPickValidationHint]}>
          Please select at least one option
        </Text>
      ) : null}
      <Animated.View style={[styles.goalsListScrollRow, styles.goalsRelationshipListScrollRow, goalsMultiSelectShakeStyle]}>
        <View style={styles.goalsListScrollListCol}>
          <GoalsAnimatedScrollView
            style={[styles.goalsListScrollViewport, { maxHeight: goalsListViewportMaxHeight }]}
            contentContainerStyle={[styles.goalsListScrollContent, styles.goalsRelationshipListScrollContent]}
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
            {STRUGGLE_TIMES.map((t, index) => (
              <View
                key={t.id}
                style={styles.goalsListRowMeasureWrap}
                onLayout={index === 0 ? onFirstGoalsRowLayout : undefined}
              >
                <GoalsSelectRow
                  label={t.label}
                  compact
                  selected={selectedTimes.includes(t.id)}
                  onPress={() => onToggleTime(t.id)}
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
