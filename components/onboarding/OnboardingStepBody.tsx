import React from "react";
import Animated, { FadeIn, type AnimatedStyle, type ScrollHandlerProcessed, type SharedValue } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

import { AppLockStep } from "./AppLockStep";
import { ScreenTimeReflectStep } from "./ScreenTimeReflectStep";
import { OnboardingAgeRangeStep } from "./pages/OnboardingAgeRangeStep";
import { OnboardingSexStep } from "./pages/OnboardingSexStep";
import { OnboardingIntroImageStep } from "./pages/OnboardingIntroImageStep";
import { OnboardingNameJourneyStep } from "./pages/OnboardingNameJourneyStep";
import { OnboardingPhoneHoursDailyStep } from "./pages/OnboardingPhoneHoursDailyStep";
import { OnboardingMoodBaselineStep } from "./pages/OnboardingMoodBaselineStep";
import { OnboardingCheckinPreviewStep } from "./pages/OnboardingCheckinPreviewStep";
import { OnboardingVerseMorningStep } from "./pages/OnboardingVerseMorningStep";
import { OnboardingStreakPreviewStep } from "./pages/OnboardingStreakPreviewStep";
import { OnboardingRemindersExplainerStep } from "./pages/OnboardingRemindersExplainerStep";
import { OnboardingProtectionExplainerStep } from "./pages/OnboardingProtectionExplainerStep";
import { OnboardingRecapStep } from "./pages/OnboardingRecapStep";
import { OnboardingPaywallStep } from "./pages/OnboardingPaywallStep";
import { OnboardingReadyStep } from "./pages/OnboardingReadyStep";
import { OnboardingGoalsPickStep } from "./pages/OnboardingGoalsPickStep";
import { OnboardingRelationshipGoalsStep } from "./pages/OnboardingRelationshipGoalsStep";
import { GOAL_BARRIERS, TOTAL_STEPS } from "@/constants/onboarding/content";
import { computeScreenTimeReflection } from "@/lib/onboarding/screenTimeReflection";

import { styles } from "./onboardingStyles";

export type OnboardingStepBodyProps = {
  step: number;
  colors: {
    introEmphasis: string;
    foreground: string;
    mutedForeground: string;
  };
  imageSlideIntroTop: number;
  imageSlideTextMaxW: number;
  userNameInput: string;
  onChangeUserName: (text: string) => void;
  profileNameSaved: string | undefined;
  onJourneyGridLayout: (width: number, height: number) => void;
  journeyRows: number[][];
  journeyCellSize: number;
  journeyColumnGap: number;
  journeyRowGap: number;
  journeyGridContentHeight: number;
  journeyGridContentWidth: number;
  dailyPhoneHours: number;
  onDailyPhoneHoursChange: (v: number) => void;
  onPhoneHoursScrollLockChange: (locked: boolean) => void;
  reflectAnimSession: number;
  mood: number;
  onMoodChange: (v: number) => void;
  closeness: number;
  onClosenessChange: (v: number) => void;
  selectedGoals: string[];
  onToggleGoal: (id: string) => void;
  showGoalsPickHint: boolean;
  selectedTimes: string[];
  onToggleTime: (id: string) => void;
  showRelationshipPickHint: boolean;
  goalsPickListViewportMaxHeight: number;
  goalsListViewportMaxHeight: number;
  goalsScrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
  goalsScrollViewportH: SharedValue<number>;
  goalsScrollContentH: SharedValue<number>;
  bumpGoalsScrollHint: () => void;
  onFirstGoalsRowLayout: (e: { nativeEvent: { layout: { height: number } } }) => void;
  goalsScrollRailStyle: AnimatedStyle<ViewStyle>;
  goalsScrollThumbStyle: AnimatedStyle<ViewStyle>;
  goalsMultiSelectShakeStyle: AnimatedStyle<ViewStyle>;
  selectedAppsCount: number;
  ageRange: string | null;
  onSelectAgeRange: (value: string | null) => void;
  showAgeRangeHint: boolean;
  sex: string | null;
  onSelectSex: (value: string | null) => void;
  showSexHint: boolean;
  /** Primary advance action (image steps FAB, app-lock chevron, paywall “Restore”, footer Continue, dhikr demo auto-advance). */
  onContinue: () => void;
  /** Step 13 only: marks streak entrance suppressed on the following step before advancing. */
  onAdvanceFromDhikrDemo?: () => void;
  /** Step 14: skip streak reward entrance when arriving from dhikr handoff. */
  suppressStreakRewardEntrance?: boolean;
};

export function OnboardingStepBody(p: OnboardingStepBodyProps) {
  switch (p.step) {
    case 0:
      return (
        <OnboardingIntroImageStep
          variant={0}
          introEmphasisColor={p.colors.introEmphasis}
          imageSlideIntroTop={p.imageSlideIntroTop}
          imageSlideTextMaxW={p.imageSlideTextMaxW}
        />
      );
    case 1:
      return (
        <OnboardingIntroImageStep
          variant={1}
          introEmphasisColor={p.colors.introEmphasis}
          imageSlideIntroTop={p.imageSlideIntroTop}
          imageSlideTextMaxW={p.imageSlideTextMaxW}
        />
      );
    case 2:
      return <AppLockStep onContinue={p.onContinue} progressCurrent={p.step} progressTotal={TOTAL_STEPS} />;
    case 3:
      return (
        <OnboardingAgeRangeStep
          ageRange={p.ageRange}
          onSelectAgeRange={p.onSelectAgeRange}
          showAgeRangeHint={p.showAgeRangeHint}
          goalsMultiSelectShakeStyle={p.goalsMultiSelectShakeStyle}
        />
      );
    case 4:
      return (
        <OnboardingNameJourneyStep
          userNameInput={p.userNameInput}
          onChangeUserName={p.onChangeUserName}
          onJourneyGridLayout={p.onJourneyGridLayout}
          journeyRows={p.journeyRows}
          journeyCellSize={p.journeyCellSize}
          journeyColumnGap={p.journeyColumnGap}
          journeyRowGap={p.journeyRowGap}
          journeyGridContentHeight={p.journeyGridContentHeight}
          journeyGridContentWidth={p.journeyGridContentWidth}
        />
      );
    case 5:
      return (
        <OnboardingPhoneHoursDailyStep
          dailyPhoneHours={p.dailyPhoneHours}
          onDailyPhoneHoursChange={p.onDailyPhoneHoursChange}
          onPhoneHoursScrollLockChange={p.onPhoneHoursScrollLockChange}
        />
      );
    case 6: {
      const trimmedName = (p.profileNameSaved || p.userNameInput.trim()) || "";
      const hasName = trimmedName.length > 0;
      const {
        hoursPerYear,
        daysPerYear,
        lifetimeDisplay,
        lifetimeRounded,
        lifetimeIsWhole,
        quranDays,
      } = computeScreenTimeReflection(p.dailyPhoneHours);

      return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.screenTimeReflect}>
          <ScreenTimeReflectStep
            key={p.reflectAnimSession}
            trimmedName={trimmedName}
            hasName={hasName}
            hoursPerYear={hoursPerYear}
            daysPerYear={daysPerYear}
            lifetimeDisplay={lifetimeDisplay}
            lifetimeRounded={lifetimeRounded}
            lifetimeIsWhole={lifetimeIsWhole}
            quranDays={quranDays}
            introEmphasis={p.colors.introEmphasis}
            foreground={p.colors.foreground}
          />
        </Animated.View>
      );
    }
    case 7:
      return (
        <OnboardingGoalsPickStep
          showGoalsPickHint={p.showGoalsPickHint}
          goalsMultiSelectShakeStyle={p.goalsMultiSelectShakeStyle}
          goalsPickListViewportMaxHeight={p.goalsPickListViewportMaxHeight}
          goalsScrollHandler={p.goalsScrollHandler}
          goalsScrollViewportH={p.goalsScrollViewportH}
          goalsScrollContentH={p.goalsScrollContentH}
          bumpGoalsScrollHint={p.bumpGoalsScrollHint}
          onFirstGoalsRowLayout={p.onFirstGoalsRowLayout}
          selectedGoals={p.selectedGoals}
          onToggleGoal={p.onToggleGoal}
          goalsScrollRailStyle={p.goalsScrollRailStyle}
          goalsScrollThumbStyle={p.goalsScrollThumbStyle}
        />
      );
    case 8:
      return (
        <OnboardingRelationshipGoalsStep
          introEmphasisColor={p.colors.introEmphasis}
          showRelationshipPickHint={p.showRelationshipPickHint}
          goalsMultiSelectShakeStyle={p.goalsMultiSelectShakeStyle}
          goalsListViewportMaxHeight={p.goalsListViewportMaxHeight}
          goalsScrollHandler={p.goalsScrollHandler}
          goalsScrollViewportH={p.goalsScrollViewportH}
          goalsScrollContentH={p.goalsScrollContentH}
          bumpGoalsScrollHint={p.bumpGoalsScrollHint}
          onFirstGoalsRowLayout={p.onFirstGoalsRowLayout}
          selectedTimes={p.selectedTimes}
          onToggleTime={p.onToggleTime}
          goalsScrollRailStyle={p.goalsScrollRailStyle}
          goalsScrollThumbStyle={p.goalsScrollThumbStyle}
        />
      );
    case 9:
      return (
        <OnboardingMoodBaselineStep
          mood={p.mood}
          onMoodChange={p.onMoodChange}
          onPhoneHoursScrollLockChange={p.onPhoneHoursScrollLockChange}
          userName={(p.profileNameSaved ?? p.userNameInput).trim()}
          emphasisColor={p.colors.introEmphasis}
        />
      );
    case 10:
      return (
        <OnboardingGoalsPickStep
          showGoalsPickHint={p.showGoalsPickHint}
          goalsMultiSelectShakeStyle={p.goalsMultiSelectShakeStyle}
          goalsPickListViewportMaxHeight={p.goalsPickListViewportMaxHeight}
          goalsScrollHandler={p.goalsScrollHandler}
          goalsScrollViewportH={p.goalsScrollViewportH}
          goalsScrollContentH={p.goalsScrollContentH}
          bumpGoalsScrollHint={p.bumpGoalsScrollHint}
          onFirstGoalsRowLayout={p.onFirstGoalsRowLayout}
          selectedGoals={p.selectedGoals}
          onToggleGoal={p.onToggleGoal}
          goalsScrollRailStyle={p.goalsScrollRailStyle}
          goalsScrollThumbStyle={p.goalsScrollThumbStyle}
          options={GOAL_BARRIERS}
          introEmphasisColor={p.colors.introEmphasis}
          titleLine1="What do you think"
          titleLine2="is stopping you from"
          titleLine3Emphasis={{ before: "reaching your ", emphasis: "goals", after: "?" }}
          titleStyle={styles.goalsStepTitleBarriers}
          mascotKey="tasbeeh"
        />
      );
    case 11:
      return (
        <OnboardingSexStep
          sex={p.sex}
          onSelectSex={p.onSelectSex}
          showSexHint={p.showSexHint}
          goalsMultiSelectShakeStyle={p.goalsMultiSelectShakeStyle}
        />
      );
    case 12:
      return <OnboardingCheckinPreviewStep onContinue={p.onContinue} />;
    case 13:
      return (
        <OnboardingVerseMorningStep onAdvance={p.onAdvanceFromDhikrDemo ?? p.onContinue} />
      );
    case 14:
      return <OnboardingStreakPreviewStep suppressRewardEntrance={p.suppressStreakRewardEntrance ?? false} />;
    case 15:
      return <OnboardingRemindersExplainerStep />;
    case 16:
      return <OnboardingProtectionExplainerStep />;
    case 17:
      return <OnboardingRecapStep selectedGoals={p.selectedGoals} selectedAppsCount={p.selectedAppsCount} />;
    case 18:
      return (
        <OnboardingPaywallStep onRestorePurchases={p.onContinue} mutedForeground={p.colors.mutedForeground} />
      );
    case 19:
      return <OnboardingReadyStep displayName={p.profileNameSaved} />;
    default:
      return null;
  }
}
