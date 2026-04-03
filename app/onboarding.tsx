import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { OnboardingStepBody } from "@/components/onboarding/OnboardingStepBody";
import { styles } from "@/components/onboarding/onboardingStyles";
import { OnboardingImageStepChrome } from "@/components/onboarding/shared/OnboardingImageStepChrome";
import { OnboardingScreenFooter } from "@/components/onboarding/shared/OnboardingScreenFooter";
import { OnboardingScreenHeader } from "@/components/onboarding/shared/OnboardingScreenHeader";
import { getImageSlideLayoutMetrics } from "@/constants/onboarding/imageSlideLayout";
import { getOnboardingNextButtonLabel } from "@/constants/onboarding/nextButtonLabel";
import { useApp } from "@/context/AppContext";
import { useGoalsPickScrollChrome } from "@/hooks/onboarding/useGoalsPickScrollChrome";
import { useJourneyBoardLayout } from "@/hooks/onboarding/useJourneyBoardLayout";
import { useOnboardingFormState } from "@/hooks/onboarding/useOnboardingFormState";
import { useOnboardingNavigation } from "@/hooks/onboarding/useOnboardingNavigation";
import { useOnboardingSyncEffects } from "@/hooks/onboarding/useOnboardingSyncEffects";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state, updateProfile, setOnboardingStep, isLoading } = useApp();

  const form = useOnboardingFormState();
  const {
    step,
    setStep,
    userNameInput,
    setUserNameInput,
    selectedGoals,
    setSelectedGoals,
    selectedApps,
    selectedTimes,
    setSelectedTimes,
    mood,
    setMood,
    closeness,
    setCloseness,
    dailyPhoneHours,
    setDailyPhoneHours,
    phoneHoursScrollLock,
    setPhoneHoursScrollLock,
    reflectAnimSession,
    setReflectAnimSession,
    showGoalsPickHint,
    setShowGoalsPickHint,
    showRelationshipPickHint,
    setShowRelationshipPickHint,
    showAgeRangeHint,
    setShowAgeRangeHint,
    ageRange,
    setAgeRange,
  } = form;

  const {
    onJourneyGridLayout,
    journeyRows,
    journeyCellSize,
    journeyColumnGap,
    journeyRowGap,
    journeyGridContentHeight,
    journeyGridContentWidth,
  } = useJourneyBoardLayout();

  const goalsScroll = useGoalsPickScrollChrome(step);

  useOnboardingSyncEffects({
    isLoading,
    step,
    profileAgeRange: state.profile.ageRange,
    setAgeRange,
    profileName: state.profile.name,
    setUserNameInput,
    profileDailyPhoneHours: state.profile.dailyPhoneHours,
    setDailyPhoneHours,
    setPhoneHoursScrollLock,
    selectedGoals,
    selectedTimesLength: selectedTimes.length,
    setShowGoalsPickHint,
    setShowRelationshipPickHint,
    ageRange,
    setShowAgeRangeHint,
  });

  const { goNext, goBack, toggleGoal, toggleTime, goalsMultiSelectShakeStyle } = useOnboardingNavigation({
    step,
    setStep,
    userNameInput,
    ageRange,
    selectedGoals,
    selectedTimes,
    dailyPhoneHours,
    mood,
    closeness,
    selectedApps,
    updateProfile,
    setOnboardingStep,
    setReflectAnimSession,
    setSelectedGoals,
    setSelectedTimes,
    setShowGoalsPickHint,
    setShowRelationshipPickHint,
    setShowAgeRangeHint,
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;
  const { imageSlideIntroTop, imageSlideTextMaxW } = getImageSlideLayoutMetrics(insets.top);

  const isImageStep = step === 0 || step === 1;
  const isPaywallStep = step === 17;
  const continueDisabled = step === 4 && userNameInput.trim().length === 0;
  const showBack = !isImageStep && step > 0;
  const profileNameSaved = state.profile.name?.trim();

  return (
    <GradientBackground style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          {
            paddingTop: isImageStep ? 0 : topPadding,
            paddingBottom: isImageStep ? 0 : bottomPadding,
          },
        ]}
      >
        <OnboardingScreenHeader
          isImageStep={isImageStep}
          topPadding={topPadding}
          showBack={showBack}
          onBack={goBack}
        />

        <ScrollView
          style={styles.scrollFlex}
          scrollEnabled={!phoneHoursScrollLock}
          contentContainerStyle={[
            styles.scrollContent,
            isImageStep && styles.scrollContentFull,
            (step === 3 || step === 7 || step === 8 || step === 10) && styles.scrollContentGoalsStep,
            step === 9 && styles.scrollContentFrequencyStep,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <OnboardingStepBody
            step={step}
            colors={{
              introEmphasis: colors.introEmphasis,
              foreground: colors.foreground,
              mutedForeground: colors.mutedForeground,
            }}
            imageSlideIntroTop={imageSlideIntroTop}
            imageSlideTextMaxW={imageSlideTextMaxW}
            userNameInput={userNameInput}
            onChangeUserName={setUserNameInput}
            profileNameSaved={profileNameSaved}
            onJourneyGridLayout={onJourneyGridLayout}
            journeyRows={journeyRows}
            journeyCellSize={journeyCellSize}
            journeyColumnGap={journeyColumnGap}
            journeyRowGap={journeyRowGap}
            journeyGridContentHeight={journeyGridContentHeight}
            journeyGridContentWidth={journeyGridContentWidth}
            dailyPhoneHours={dailyPhoneHours}
            onDailyPhoneHoursChange={setDailyPhoneHours}
            onPhoneHoursScrollLockChange={setPhoneHoursScrollLock}
            reflectAnimSession={reflectAnimSession}
            mood={mood}
            onMoodChange={setMood}
            closeness={closeness}
            onClosenessChange={setCloseness}
            selectedGoals={selectedGoals}
            onToggleGoal={toggleGoal}
            showGoalsPickHint={showGoalsPickHint}
            selectedTimes={selectedTimes}
            onToggleTime={toggleTime}
            showRelationshipPickHint={showRelationshipPickHint}
            goalsPickListViewportMaxHeight={goalsScroll.goalsPickListViewportMaxHeight}
            goalsListViewportMaxHeight={goalsScroll.goalsListViewportMaxHeight}
            goalsScrollHandler={goalsScroll.goalsScrollHandler}
            goalsScrollViewportH={goalsScroll.goalsScrollViewportH}
            goalsScrollContentH={goalsScroll.goalsScrollContentH}
            bumpGoalsScrollHint={goalsScroll.bumpGoalsScrollHint}
            onFirstGoalsRowLayout={goalsScroll.onFirstGoalsRowLayout}
            goalsScrollRailStyle={goalsScroll.goalsScrollRailStyle}
            goalsScrollThumbStyle={goalsScroll.goalsScrollThumbStyle}
            goalsMultiSelectShakeStyle={goalsMultiSelectShakeStyle}
            selectedAppsCount={selectedApps.length}
            ageRange={ageRange}
            onSelectAgeRange={setAgeRange}
            showAgeRangeHint={showAgeRangeHint}
            onContinue={goNext}
          />
        </ScrollView>

        {!isImageStep ? (
          <OnboardingScreenFooter
            step={step}
            nextLabel={getOnboardingNextButtonLabel(step)}
            onNext={goNext}
            isPaywallStep={isPaywallStep}
            continueDisabled={continueDisabled}
          />
        ) : (
          <OnboardingImageStepChrome
            bottomPadding={bottomPadding}
            primaryColor={colors.primary}
            primaryForeground={colors.primaryForeground}
            currentStep={step}
            onContinue={goNext}
          />
        )}
      </View>
    </GradientBackground>
  );
}
