import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  withDelay,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/components/GradientBackground";
import { NormalizedLockAppIcon, type LockAppId } from "@/components/NormalizedLockAppIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressDots } from "@/components/ProgressDots";
import { SliderInput } from "@/components/SliderInput";
import { mascots } from "@/constants/mascots";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ONBOARDING_IMAGE_1 = require("@/assets/mascot/onboarding1.png");
const ONBOARDING_IMAGE_2 = require("@/assets/mascot/onboarding2.png");

const APP_LOCK_APPS: Array<{ id: LockAppId; label: string }> = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "snapchat", label: "Snapchat" },
  { id: "x", label: "X" },
];

const GOALS = [
  { id: "pray", label: "Pray more consistently" },
  { id: "time", label: "Waste less time" },
  { id: "closer", label: "Feel closer to Allah" },
  { id: "scroll", label: "Stop doomscrolling" },
  { id: "discipline", label: "Become more disciplined" },
  { id: "grateful", label: "Practice more gratitude" },
];

const SOCIAL_APPS = [
  { id: "instagram", label: "Instagram", icon: "logo-instagram" as const },
  { id: "tiktok", label: "TikTok", icon: "musical-notes" as const },
  { id: "twitter", label: "X / Twitter", icon: "logo-twitter" as const },
  { id: "youtube", label: "YouTube", icon: "logo-youtube" as const },
  { id: "reddit", label: "Reddit", icon: "logo-reddit" as const },
  { id: "snapchat", label: "Snapchat", icon: "camera" as const },
  { id: "facebook", label: "Facebook", icon: "logo-facebook" as const },
  { id: "whatsapp", label: "WhatsApp", icon: "chatbubble-ellipses" as const },
];

const STRUGGLE_TIMES = [
  { id: "morning", label: "Morning", sub: "Right after waking up" },
  { id: "afternoon", label: "After school / work" },
  { id: "evening", label: "Evening", sub: "Wind-down time" },
  { id: "latenight", label: "Late night", sub: "Before sleep" },
  { id: "bored", label: "When bored", sub: "Any time" },
];

const TOTAL_STEPS = 17;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state, updateProfile, setOnboardingStep } = useApp();
  const [step, setStep] = useState(0);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>(["instagram", "tiktok", "twitter"]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [mood, setMood] = useState(5);
  const [closeness, setCloseness] = useState(5);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  /** Image steps 0–1: intro line ~10% from top (9–11% band), respecting notch */
  const imageSlideIntroTop = Math.max(insets.top + 6, SCREEN_H * 0.105);
  /** 24px side padding, cap width ~84% so lines do not stretch edge-to-edge */
  const imageSlideTextMaxW = Math.min(Math.round(SCREEN_W * 0.84), SCREEN_W - 48);

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      setOnboardingStep(step + 1);
    } else {
      finishOnboarding();
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const finishOnboarding = () => {
    updateProfile({
      goals: selectedGoals,
      appsToBlock: selectedApps,
      struggleTimes: selectedTimes,
      moodBaseline: mood,
      closenessBaseline: closeness,
      onboardingComplete: true,
    });
    router.replace("/(tabs)");
  };

  const toggleGoal = (id: string) => {
    Haptics.selectionAsync();
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleApp = (id: string) => {
    Haptics.selectionAsync();
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleTime = (id: string) => {
    Haptics.selectionAsync();
    setSelectedTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.fullScreen}>
            <View style={styles.imageSlideArtWrap}>
              <Image
                source={ONBOARDING_IMAGE_1}
                style={styles.fullImage}
                resizeMode="cover"
              />
            </View>
            <LinearGradient
              colors={["transparent", "rgba(13,6,32,0.65)", "#0d0620"]}
              style={styles.imageOverlay}
            />
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              style={[styles.imageSlideIntroWrap, { top: imageSlideIntroTop }]}
            >
              <Text style={[styles.imageSlideIntroText, { maxWidth: imageSlideTextMaxW }]}>
                Social media addiction is taking you away from <Text style={styles.imageSlideIntroEmphasis}>Allah</Text>.
              </Text>
            </Animated.View>
          </View>
        );

      case 1:
        return (
          <View style={styles.fullScreen}>
            <View style={styles.imageSlideArtWrap}>
              <Image
                source={ONBOARDING_IMAGE_2}
                style={styles.fullImage}
                resizeMode="cover"
              />
            </View>
            <LinearGradient
              colors={["transparent", "rgba(13,6,32,0.55)", "#0d0620"]}
              style={styles.imageOverlay}
            />
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              style={[styles.imageSlideIntroWrap, { top: imageSlideIntroTop }]}
            >
              <Text style={[styles.imageSlideIntroText, { maxWidth: imageSlideTextMaxW }]}>
                <Text style={styles.imageSlideIntroEmphasis}>Dhikr App</Text> can help you choose your faith first daily.
              </Text>
            </Animated.View>
          </View>
        );

      case 2:
        return (
          <AppLockStep onContinue={goNext} progressCurrent={step} progressTotal={TOTAL_STEPS} />
        );

      case 3:
        return (
          <CenteredStep>
            <Text style={[styles.stepTitle, { marginTop: 0 }]}>Choose what to{"\n"}protect your time from.</Text>
            <Text style={styles.stepSub}>These apps will ask for a short pause before opening.</Text>
            <View style={styles.appGrid}>
              {SOCIAL_APPS.map((app) => {
                const selected = selectedApps.includes(app.id);
                return (
                  <Pressable
                    key={app.id}
                    style={[
                      styles.appCard,
                      selected && styles.appCardSelected,
                      { borderColor: selected ? colors.primary : colors.border },
                    ]}
                    onPress={() => toggleApp(app.id)}
                  >
                    <Ionicons
                      name={app.icon}
                      size={22}
                      color={selected ? colors.primary : colors.mutedForeground}
                    />
                    <Text style={[styles.appLabel, { color: selected ? colors.foreground : colors.mutedForeground }]}>
                      {app.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CenteredStep>
        );

      case 4:
        return (
          <CenteredStep>
            <OnboardingMascot variant="tasbeeh" float />
            <Text style={styles.stepTitle}>Your 30-second{"\n"}check-in.</Text>
            <View style={styles.ritualCards}>
              {[
                { num: "1", title: "How am I feeling?", sub: "Quick 1–10 check-in" },
                { num: "2", title: "How close to Allah?", sub: "Honest reflection" },
                { num: "3", title: "Dhikr or Dua", sub: "Under 30 seconds" },
              ].map((r) => (
                <View key={r.num} style={styles.ritualCard}>
                  <View style={styles.ritualNum}>
                    <Text style={styles.ritualNumText}>{r.num}</Text>
                  </View>
                  <View style={styles.ritualInfo}>
                    <Text style={styles.ritualTitle}>{r.title}</Text>
                    <Text style={styles.ritualSub}>{r.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </CenteredStep>
        );

      case 5:
        return (
          <CenteredStep>
            <Text style={styles.stepTitle}>What are you{"\n"}hoping to change?</Text>
            <Text style={styles.stepSub}>Choose all that resonate.</Text>
            <View style={styles.goalList}>
              {GOALS.map((g) => {
                const sel = selectedGoals.includes(g.id);
                return (
                  <Pressable
                    key={g.id}
                    style={[
                      styles.goalItem,
                      sel && styles.goalItemSelected,
                      { borderColor: sel ? colors.primary : colors.border },
                    ]}
                    onPress={() => toggleGoal(g.id)}
                  >
                    <View style={[styles.goalCheck, sel && { backgroundColor: colors.primary }]}>
                      {sel && <Ionicons name="checkmark" size={14} color="#1a0a2e" />}
                    </View>
                    <Text style={[styles.goalLabel, { color: sel ? colors.foreground : colors.mutedForeground }]}>
                      {g.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CenteredStep>
        );

      case 6:
        return (
          <CenteredStep>
            <Text style={styles.stepTitle}>When do you{"\n"}struggle most?</Text>
            <Text style={styles.stepSub}>We'll send gentle reminders at the right moments.</Text>
            <View style={styles.goalList}>
              {STRUGGLE_TIMES.map((t) => {
                const sel = selectedTimes.includes(t.id);
                return (
                  <Pressable
                    key={t.id}
                    style={[
                      styles.goalItem,
                      sel && styles.goalItemSelected,
                      { borderColor: sel ? colors.primary : colors.border },
                    ]}
                    onPress={() => toggleTime(t.id)}
                  >
                    <View style={[styles.goalCheck, sel && { backgroundColor: colors.primary }]}>
                      {sel && <Ionicons name="checkmark" size={14} color="#1a0a2e" />}
                    </View>
                    <View>
                      <Text style={[styles.goalLabel, { color: sel ? colors.foreground : colors.mutedForeground }]}>
                        {t.label}
                      </Text>
                      {t.sub && (
                        <Text style={[styles.ritualSub, { marginTop: 1 }]}>{t.sub}</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </CenteredStep>
        );

      case 7:
        return (
          <CenteredStep>
            <Text style={styles.stepTitle}>How have you been{"\n"}feeling lately?</Text>
            <Text style={styles.stepSub}>Be honest. This is just for you.</Text>
            <View style={styles.sliderBlock}>
              <Text style={styles.sliderLabel}>
                {mood <= 3 ? "Not great" : mood <= 6 ? "Getting by" : mood <= 8 ? "Pretty good" : "Really well"}
              </Text>
              <SliderInput value={mood} onChange={setMood} min={1} max={10} />
              <Text style={styles.sliderHint}>1 = struggling · 10 = thriving</Text>
            </View>
          </CenteredStep>
        );

      case 8:
        return (
          <CenteredStep>
            <Text style={styles.stepTitle}>How close to Allah{"\n"}do you feel lately?</Text>
            <Text style={styles.stepSub}>No judgment. This is your private baseline.</Text>
            <View style={styles.sliderBlock}>
              <Text style={styles.sliderLabel}>
                {closeness <= 3 ? "Distant" : closeness <= 6 ? "Somewhere in between" : closeness <= 8 ? "Connected" : "Very close"}
              </Text>
              <SliderInput value={closeness} onChange={setCloseness} min={1} max={10} />
              <Text style={styles.sliderHint}>1 = very distant · 10 = deeply connected</Text>
            </View>
          </CenteredStep>
        );

      case 9:
        return (
          <CenteredStep>
            <OnboardingMascot variant="mag" float />
            <Text style={styles.stepTitle}>Here's how your{"\n"}check-in works.</Text>
            <View style={styles.previewCards}>
              <View style={styles.previewCard}>
                <Text style={styles.previewIcon}>  </Text>
                <Text style={styles.previewCardTitle}>Quick check-in</Text>
                <Text style={styles.previewCardSub}>How are you feeling?</Text>
              </View>
              <View style={styles.previewCard}>
                <Ionicons name="heart" size={22} color="#C4A2F7" />
                <Text style={styles.previewCardTitle}>Closeness check</Text>
                <Text style={styles.previewCardSub}>How close to Allah?</Text>
              </View>
              <View style={styles.previewCard}>
                <Ionicons name="sparkles" size={22} color="#F5C842" />
                <Text style={styles.previewCardTitle}>Dhikr or Dua</Text>
                <Text style={styles.previewCardSub}>Under 30 seconds</Text>
              </View>
            </View>
          </CenteredStep>
        );

      case 10:
        return (
          <CenteredStep>
            <Ionicons name="book-outline" size={60} color="#C4A2F7" />
            <Text style={styles.stepTitle}>Begin each day{"\n"}with something grounding.</Text>
            <View style={styles.verseCard}>
              <Text style={styles.verseArabic}>وَلَذِكْرُ اللَّهِ أَكْبَرُ</Text>
              <Text style={styles.verseTranslit}>Wa ladhikru-Llāhi akbar</Text>
              <Text style={styles.verseTranslation}>"And the remembrance of Allah is greatest."</Text>
              <Text style={styles.verseRef}>— Quran 29:45</Text>
            </View>
            <Text style={styles.stepSub}>A new verse every morning. Your anchor before the day begins.</Text>
          </CenteredStep>
        );

      case 11:
        return (
          <CenteredStep>
            <Ionicons name="sparkles" size={60} color="#F5C842" />
            <Text style={styles.stepTitle}>Small consistency{"\n"}matters most.</Text>
            <View style={styles.streakPreview}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={[styles.streakDay, i < 4 && styles.streakDayActive]}>
                  <Text style={[styles.streakDayLabel, { color: i < 4 ? "#1a0a2e" : "#9b80c8" }]}>{d}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.stepSub}>
              Every day you complete your check-in builds your streak.{"\n"}
              Not perfection — just return.
            </Text>
          </CenteredStep>
        );

      case 12:
        return (
          <CenteredStep>
            <Ionicons name="notifications-outline" size={60} color="#C4A2F7" />
            <Text style={styles.stepTitle}>Let us remind you{"\n"}before distraction sets in.</Text>
            <View style={styles.notifList}>
              {[
                { icon: "sunny-outline" as const, label: "Morning nudge" },
                { icon: "moon-outline" as const, label: "Before sleep" },
                { icon: "phone-portrait-outline" as const, label: "When you're about to scroll" },
              ].map((n) => (
                <View key={n.label} style={styles.notifItem}>
                  <Ionicons name={n.icon} size={20} color="#C4A2F7" />
                  <Text style={styles.notifLabel}>{n.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.stepSub}>Reminders that feel like a gentle hand on your shoulder, not a loud alarm.</Text>
          </CenteredStep>
        );

      case 13:
        return (
          <CenteredStep>
            <Ionicons name="shield-checkmark-outline" size={60} color="#C4A2F7" />
            <Text style={styles.stepTitle}>How the{"\n"}protection works.</Text>
            <View style={styles.permissionExplain}>
              <Text style={styles.permExplainBody}>
                Dhikr uses Screen Time access to gently pause your selected apps
                until your check-in is complete.{"\n\n"}
                You stay in complete control — you can always adjust or remove
                any protected app at any time.{"\n\n"}
                No data is shared. Everything stays private on your device.
              </Text>
            </View>
          </CenteredStep>
        );

      case 14:
        return (
          <CenteredStep>
            <Ionicons name="checkmark-circle-outline" size={60} color="#C4A2F7" />
            <Text style={styles.stepTitle}>You've done the{"\n"}hardest part already.</Text>
            <View style={styles.recapList}>
              {selectedGoals.slice(0, 2).map((g) => {
                const goal = GOALS.find((go) => go.id === g);
                return goal ? (
                  <View key={g} style={styles.recapItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
                    <Text style={styles.recapLabel}>{goal.label}</Text>
                  </View>
                ) : null;
              })}
              <View style={styles.recapItem}>
                <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
                <Text style={styles.recapLabel}>{selectedApps.length} apps to protect</Text>
              </View>
              <View style={styles.recapItem}>
                <Ionicons name="checkmark-circle" size={18} color="#C4A2F7" />
                <Text style={styles.recapLabel}>Your baseline is set</Text>
              </View>
            </View>
            <Text style={styles.stepSub}>
              One small step is all it takes to start.
            </Text>
          </CenteredStep>
        );

      case 15:
        return (
          <CenteredStep>
            <Text style={styles.stepTitle}>Start your free trial.</Text>
            <Text style={styles.stepSub}>Everything you need to choose faith first, every day.</Text>
            <View style={[styles.paywallCard, styles.paywallCardBest]}>
              <View style={styles.paywallBestBadge}>
                <Text style={styles.paywallBestText}>Best Value</Text>
              </View>
              <Text style={styles.paywallPlan}>Yearly</Text>
              <Text style={styles.paywallPrice}>$3.99 / month</Text>
              <Text style={styles.paywallSub}>$47.99 billed annually · 3-day free trial</Text>
            </View>
            <View style={styles.paywallCard}>
              <Text style={styles.paywallPlan}>Weekly</Text>
              <Text style={styles.paywallPrice}>$1.99 / week</Text>
            </View>
            <Pressable onPress={goNext}>
              <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>Restore Purchases</Text>
            </Pressable>
          </CenteredStep>
        );

      case 16:
        return (
          <CenteredStep>
            <Ionicons name="moon" size={62} color="#F5C842" />
            <Text style={styles.stepTitle}>You're ready.</Text>
            <Text style={styles.stepSub}>
              Even 30 seconds of remembrance can change the direction of your day.{"\n\n"}
              Let's begin.
            </Text>
          </CenteredStep>
        );

      default:
        return null;
    }
  };

  const isImageStep = step === 0 || step === 1;
  const isLastStep = step === TOTAL_STEPS - 1;
  const isPaywallStep = step === 15;

  const getNextLabel = () => {
    if (isLastStep) return "Begin";
    if (isPaywallStep) return "Start Free Trial";
    if (step === 12 || step === 13) return "Allow";
    return "Continue";
  };

  const showBack = !isImageStep && step > 0;

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
        {isImageStep ? (
          <View style={[styles.headerImage, styles.headerAbsolute, { top: topPadding }]}>
            {showBack ? (
              <Pressable onPress={goBack} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="rgba(196,162,247,0.7)" />
              </Pressable>
            ) : (
              <View style={styles.backBtnSmall} />
            )}
            <View style={styles.backBtnSmall} />
          </View>
        ) : (
          <View style={styles.header}>
            {showBack ? (
              <Pressable onPress={goBack} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="rgba(196,162,247,0.7)" />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            <View style={styles.backBtn} />
          </View>
        )}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isImageStep && styles.scrollContentFull,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderStep()}
        </ScrollView>

        {!isImageStep ? (
          step === 2 ? null : (
            <View style={styles.footer}>
              <PrimaryButton
                label={getNextLabel()}
                onPress={goNext}
                style={styles.nextBtn}
                variant={isPaywallStep ? "gold" : "primary"}
              />
              <View style={styles.bottomProgress}>
                <ProgressDots total={TOTAL_STEPS} current={step} variant="thin" />
              </View>
            </View>
          )
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            onPress={goNext}
            style={[
              styles.imageStepArrowFab,
              {
                bottom: bottomPadding + 68,
                backgroundColor: colors.primary,
              },
            ]}
            hitSlop={12}
          >
            <Ionicons name="arrow-forward" size={26} color={colors.primaryForeground} />
          </Pressable>
        )}

        {isImageStep && step !== 2 && (
          <View
            style={[
              styles.imageBottomProgress,
              { bottom: Platform.OS === "web" ? 12 : bottomPadding + 20 },
            ]}
          >
            <ProgressDots total={TOTAL_STEPS} current={step} variant="thin" />
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

function CenteredStep({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.centeredStep}>
      {children}
    </Animated.View>
  );
}

function AppLockStep({
  onContinue,
  progressCurrent = 2,
  progressTotal = 17,
}: {
  onContinue?: () => void;
  progressCurrent?: number;
  progressTotal?: number;
}) {
  const pulse = useSharedValue(0);
  const cardFloat1 = useSharedValue(0);
  const cardFloat2 = useSharedValue(0);
  const cardFloat3 = useSharedValue(0);
  const cardFloat4 = useSharedValue(0);
  const progressValue = Math.max(0, Math.min(1, (progressCurrent + 1) / progressTotal));

  useEffect(() => {
    // Gentle, non-distracting arrow pulse.
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Very subtle staggered drift for a calmer, premium feel.
    cardFloat1.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(-1.8, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat2.value = withDelay(
      280,
      withRepeat(
        withSequence(
          withTiming(-2.2, { duration: 3800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat3.value = withDelay(
      520,
      withRepeat(
        withSequence(
          withTiming(-1.6, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    cardFloat4.value = withDelay(
      760,
      withRepeat(
        withSequence(
          withTiming(-2, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [pulse, cardFloat1, cardFloat2, cardFloat3, cardFloat4]);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.2 * pulse.value,
    transform: [{ translateY: -0.95 * pulse.value }],
  }));
  const cardFloatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat1.value }],
  }));
  const cardFloatStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat2.value }],
  }));
  const cardFloatStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat3.value }],
  }));
  const cardFloatStyle4 = useAnimatedStyle(() => ({
    transform: [{ translateY: cardFloat4.value }],
  }));
  const cardFloatStyles = [cardFloatStyle1, cardFloatStyle2, cardFloatStyle3, cardFloatStyle4];

  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.appLockContainer}>
      <View style={styles.contentWrapper}>
        <View style={styles.contentStack}>
          <View style={styles.appLockIconGrid}>
            <View style={styles.appLockIconRow}>
              {APP_LOCK_APPS.slice(0, 2).map((app, index) => (
                <Animated.View
                  key={app.id}
                  style={[styles.appLockCard, cardFloatStyles[index]]}
                  accessibilityLabel={`${app.label} (locked)`}
                >
                  <View style={styles.appLockCardGlow} pointerEvents="none" />
                  <NormalizedLockAppIcon id={app.id} />
                  <View style={styles.appLockLockBadge} pointerEvents="none">
                    <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                  </View>
                </Animated.View>
              ))}
            </View>

            <View style={styles.appLockIconRow}>
              {APP_LOCK_APPS.slice(2, 4).map((app, index) => (
                <Animated.View
                  key={app.id}
                  style={[styles.appLockCard, cardFloatStyles[index + 2]]}
                  accessibilityLabel={`${app.label} (locked)`}
                >
                  <View style={styles.appLockCardGlow} pointerEvents="none" />
                  <NormalizedLockAppIcon id={app.id} />
                  <View style={styles.appLockLockBadge} pointerEvents="none">
                    <Ionicons name="lock-closed" size={15} color="rgba(235,225,255,0.9)" />
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.appLockCopyWrap}>
            <Text style={styles.appLockHeadline}>Lock distracting apps</Text>
          </View>
        </View>
      </View>

      <View style={styles.appLockBottom}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          onPress={onContinue}
          disabled={!onContinue}
          hitSlop={12}
          style={styles.appLockArrowPress}
        >
          <Animated.View style={[styles.appLockArrowInner, arrowStyle]}>
            <Ionicons name="chevron-down" size={32} color="rgba(240,234,255,0.64)" />
          </Animated.View>
        </Pressable>

        <View style={styles.appLockProgressWrap} pointerEvents="none">
          <View style={styles.appLockProgressTrack}>
            <View style={[styles.appLockProgressFill, { width: `${progressValue * 100}%` }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function PremiumOnboardingArt() {
  return <OnboardingMascot variant="hero" size="large" />;
}

function OnboardingMascot({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnSmall: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scrollContentFull: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  centeredStep: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  fullScreen: {
    width: SCREEN_W,
    height: SCREEN_H,
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  imageSlideArtWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  /** Onboarding image slides 0–1 only: top intro zone (not title/body hierarchy) */
  imageSlideIntroWrap: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "flex-start",
  },
  smallTag: {
    fontSize: 13,
    color: "rgba(196,162,247,0.7)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  imageSlideIntroText: {
    fontSize: 31,
    fontFamily: "Inter_500Medium",
    color: "#f4eeff",
    lineHeight: 39,
    letterSpacing: -0.2,
    width: "100%",
    textAlign: "left",
  },
  imageSlideIntroEmphasis: {
    color: "#D7C0FF",
    opacity: 1,
  },
  imageStepArrowFab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  mascotMedium: {
    width: 140,
    height: 140,
  },
  mascotStage: {
    width: 178,
    height: 178,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  artStage: {
    width: 250,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  artFloatLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  artGlow: {
    position: "absolute",
    width: 214,
    height: 214,
    borderRadius: 107,
    backgroundColor: "rgba(196,162,247,0.2)",
    shadowColor: "#F3D792",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 0,
  },
  mascotGlow: {
    position: "absolute",
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: "rgba(196,162,247,0.18)",
    shadowColor: "#F3D792",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 0,
  },
  artSurface: {
    width: 236,
    height: 236,
    borderRadius: 118,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,14,54,0.18)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 0,
  },
  mascotSurface: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(32,14,54,0.18)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 0,
  },
  artMascot: {
    width: "100%",
    height: "100%",
  },
  heroMascotLarge: {
    width: "116%",
    height: "116%",
  },
  heroMascotMedium: {
    width: "114%",
    height: "114%",
  },
  framedMascotLarge: {
    width: "108%",
    height: "108%",
  },
  framedMascotMedium: {
    width: "110%",
    height: "110%",
  },
  mascotLarge: {
    width: 240,
    height: 240,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 37,
    marginTop: 4,
    maxWidth: 300,
  },
  stepSub: {
    fontSize: 15,
    color: "rgba(196,162,247,0.75)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 23,
    paddingHorizontal: 4,
    maxWidth: 310,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featurePill: {
    backgroundColor: "rgba(196,162,247,0.12)",
    borderColor: "rgba(196,162,247,0.25)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    color: "#C4A2F7",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  appGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    maxWidth: 340,
  },
  appCard: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(45,26,74,0.6)",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  appCardSelected: {
    backgroundColor: "rgba(196,162,247,0.1)",
  },
  appLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  ritualCards: {
    gap: 12,
    width: "100%",
  },
  ritualCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45,26,74,0.6)",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
  },
  ritualNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(196,162,247,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ritualNumText: {
    color: "#C4A2F7",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  ritualInfo: {
    flex: 1,
  },
  ritualTitle: {
    color: "#f0eaff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  ritualSub: {
    color: "#9b80c8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  goalList: {
    gap: 10,
    width: "100%",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(45,26,74,0.5)",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  goalItemSelected: {
    backgroundColor: "rgba(196,162,247,0.08)",
  },
  goalCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(196,162,247,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  sliderBlock: {
    alignItems: "center",
    gap: 16,
    paddingTop: 20,
  },
  sliderLabel: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: "#f0eaff",
  },
  sliderHint: {
    fontSize: 13,
    color: "rgba(155,128,200,0.7)",
    fontFamily: "Inter_400Regular",
  },
  previewCards: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  previewCard: {
    width: 100,
    backgroundColor: "rgba(45,26,74,0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  previewIcon: {
    fontSize: 22,
  },
  previewCardTitle: {
    color: "#f0eaff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  previewCardSub: {
    color: "#9b80c8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  verseCard: {
    backgroundColor: "rgba(45,26,74,0.7)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.2)",
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  verseArabic: {
    fontSize: 26,
    color: "#F5C842",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 40,
  },
  verseTranslit: {
    color: "rgba(240,234,255,0.8)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
  },
  verseTranslation: {
    color: "#f0eaff",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  verseRef: {
    color: "#9b80c8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  streakPreview: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  streakDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(45,26,74,0.6)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakDayActive: {
    backgroundColor: "#C4A2F7",
    borderColor: "#C4A2F7",
  },
  streakDayLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  notifList: {
    gap: 12,
    width: "100%",
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(45,26,74,0.5)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  notifLabel: {
    color: "#f0eaff",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  permissionExplain: {
    backgroundColor: "rgba(45,26,74,0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    padding: 24,
    width: "100%",
  },
  permExplainBody: {
    color: "rgba(224,208,255,0.85)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    textAlign: "center",
  },
  recapList: {
    gap: 10,
    width: "100%",
  },
  recapItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  recapLabel: {
    color: "#f0eaff",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  paywallCard: {
    width: "100%",
    backgroundColor: "rgba(45,26,74,0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
    padding: 20,
    gap: 4,
    position: "relative",
  },
  paywallCardBest: {
    borderColor: "#F5C842",
    backgroundColor: "rgba(245,200,66,0.06)",
  },
  paywallBestBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#F5C842",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paywallBestText: {
    color: "#1a0a2e",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  paywallPlan: {
    color: "#f0eaff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  paywallPrice: {
    color: "#C4A2F7",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  paywallSub: {
    color: "#9b80c8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  restoreText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 4,
  },
  bottomProgress: {
    marginTop: 8,
    alignItems: "center",
  },
  imageBottomProgress: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  appLockContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    // Move the grid+headline block down to avoid a top-heavy feel.
    paddingTop: 0,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentStack: {
    alignItems: "center",
    gap: 22,
  },
  appLockIconGrid: {
    flexDirection: "column",
    gap: 26,
    alignItems: "center",
  },
  appLockIconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 26,
  },
  appLockCard: {
    width: 82,
    height: 82,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  appLockCardGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(196,162,247,0.1)",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 0,
  },
  appLockIconClip: {
    width: 64,
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  appLockIconImage: {
    opacity: 1,
  },
  appLockLockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  appLockCopyWrap: {
    alignItems: "center",
    width: 196,
    paddingHorizontal: 0,
    gap: 0,
  },
  appLockHeadline: {
    fontSize: 21,
    fontFamily: "Inter_500Medium",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 27,
    letterSpacing: -0.08,
  },
  appLockSubline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(196,162,247,0.62)",
    textAlign: "center",
    lineHeight: 19,
  },
  appLockArrowPress: {
    marginBottom: 0,
  },
  appLockArrowInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  appLockBottom: {
    width: "100%",
    alignItems: "center",
    gap: 22,
    paddingBottom: 0,
  },
  appLockProgressWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 0,
  },
  appLockProgressTrack: {
    width: "78%",
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(196,162,247,0.12)",
    overflow: "hidden",
  },
  appLockProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(235,226,255,0.46)",
  },
  nextBtn: {
    width: "100%",
  },
});
