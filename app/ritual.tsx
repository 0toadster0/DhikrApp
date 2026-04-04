import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { styles as onboardingStyles } from "@/components/onboarding/onboardingStyles";
import { GradientBackground } from "@/components/GradientBackground";
import { MascotImage } from "@/components/MascotImage";
import { mascots } from "@/constants/mascots";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SliderInput } from "@/components/SliderInput";
import { BLOCKED_DHIKR, type BlockedDhikr } from "@/constants/blockedDhikr";
import { QURANIC_DUAS, type Dua } from "@/constants/quranicDuas";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { getRandomBlockedDhikr } from "@/utils/getRandomBlockedDhikr";
import { getRandomDua } from "@/utils/getRandomDua";
import {
  capture,
  DHIKR_SOURCES,
  hasCompletedFirstDhikr,
  markFirstDhikrCompleted,
  screen,
  type RitualEntrySource,
} from "@/lib/analytics";
import {
  recordDhikrCompleted,
  recordRitualSessionStarted,
  recordSessionWellbeing,
} from "@/lib/insightsLocal";

type RitualStep = "intercept" | "mood" | "closeness" | "choose" | "dhikr" | "dua" | "complete";

let lastShownRitualDuaId: Dua["id"] | undefined;
let lastShownRitualDhikrId: BlockedDhikr["id"] | undefined;

function parseRouteParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function parseEntrySourceParam(raw: string | undefined): RitualEntrySource | undefined {
  if (raw === "notification" || raw === "home") return raw;
  return undefined;
}

function buildRitualEntryAnalytics(
  isDirectFlow: boolean,
  practice: string | undefined,
  guidedChosenPractice: "dhikr" | "dua" | null,
  entrySourceParam: RitualEntrySource | undefined
) {
  const entry_mode = isDirectFlow ? "direct" : "guided";
  const entry_practice = isDirectFlow
    ? practice === "dhikr"
      ? "dhikr"
      : practice === "dua"
        ? "dua"
        : null
    : guidedChosenPractice;
  return {
    entry_mode,
    entry_practice,
    ...(entrySourceParam ? { entry_source: entrySourceParam } : {}),
  };
}

function pickNextRitualDhikr(): BlockedDhikr | null {
  try {
    const nextDhikr = getRandomBlockedDhikr(lastShownRitualDhikrId);
    lastShownRitualDhikrId = nextDhikr.id;

    return nextDhikr;
  } catch {
    const fallbackDhikr = BLOCKED_DHIKR[0] ?? null;
    lastShownRitualDhikrId = fallbackDhikr?.id;

    return fallbackDhikr;
  }
}

function pickNextRitualDua(): Dua | null {
  try {
    const nextDua = getRandomDua(lastShownRitualDuaId);
    lastShownRitualDuaId = nextDua.id;

    return nextDua;
  } catch {
    const fallbackDua = QURANIC_DUAS[0] ?? null;
    lastShownRitualDuaId = fallbackDua?.id;

    return fallbackDua;
  }
}

const DHIKR_LOGO_BOX = 52;
const DHIKR_LOGO_GLOW = 44;

export default function RitualScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { completeSession, state } = useApp();

  const params = useLocalSearchParams<{
    flow?: string;
    practice?: string;
    entry_source?: string;
  }>();
  const flow = parseRouteParam(params.flow);
  const practice = parseRouteParam(params.practice);
  const entrySourceParam = parseEntrySourceParam(parseRouteParam(params.entry_source));
  const isDirectFlow =
    flow === "direct" && (practice === "dhikr" || practice === "dua");

  const [guidedChosenPractice, setGuidedChosenPractice] = useState<"dhikr" | "dua" | null>(
    null
  );

  const ritualEntryAnalytics = buildRitualEntryAnalytics(
    isDirectFlow,
    practice,
    guidedChosenPractice,
    entrySourceParam
  );

  const [ritualStep, setRitualStep] = useState<RitualStep>(() => {
    if (flow === "direct" && practice === "dhikr") return "dhikr";
    if (flow === "direct" && practice === "dua") return "dua";
    return "intercept";
  });
  const [mood, setMood] = useState(5);
  const [closeness, setCloseness] = useState(5);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<BlockedDhikr | null>(() =>
    flow === "direct" && practice === "dhikr" ? pickNextRitualDhikr() : null
  );
  const [selectedDua, setSelectedDua] = useState<Dua | null>(() =>
    flow === "direct" && practice === "dua" ? pickNextRitualDua() : null
  );
  const [dhikrStartedAt, setDhikrStartedAt] = useState<number | null>(() =>
    flow === "direct" && practice === "dhikr" ? Date.now() : null
  );

  const dhikrPressed = useSharedValue(0);
  /** Prevents double completion from rapid taps / races (one session write + one context session). */
  const ritualOutcomeCommittedRef = React.useRef(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelectDhikr = () => {
    setGuidedChosenPractice("dhikr");
    setSelectedDua(null);
    setDhikrCount(0);
    setSelectedDhikr(pickNextRitualDhikr());
    capture("dhikr_started", {
      dhikr_id: "ritual_random",
      dhikr_title: "Random dhikr",
      category: "ritual",
      dhikr_source: DHIKR_SOURCES[1],
      ...buildRitualEntryAnalytics(isDirectFlow, practice, "dhikr", entrySourceParam),
    });
    setDhikrStartedAt(Date.now());
    setRitualStep("dhikr");
  };

  const handleSelectDua = () => {
    setGuidedChosenPractice("dua");
    setSelectedDhikr(null);
    const nextDua = pickNextRitualDua();
    setSelectedDua(nextDua);
    capture("dua_started", {
      ...buildRitualEntryAnalytics(isDirectFlow, practice, "dua", entrySourceParam),
      dua_id: nextDua?.id,
    });
    setRitualStep("dua");
  };

  const handleDhikrTap = () => {
    if (!selectedDhikr) {
      return;
    }

    if (dhikrCount >= selectedDhikr.count) {
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCount = dhikrCount + 1;
    setDhikrCount(newCount);

    if (newCount >= selectedDhikr.count) {
      if (ritualOutcomeCommittedRef.current) return;
      ritualOutcomeCommittedRef.current = true;
      const durationSeconds = dhikrStartedAt
        ? Math.max(1, Math.round((Date.now() - dhikrStartedAt) / 1000))
        : null;
      void (async () => {
        try {
          await recordDhikrCompleted();
          // Direct ritual skips check-in sliders; do not persist default 5/5 as wellbeing.
          if (!isDirectFlow) {
            await recordSessionWellbeing(mood, closeness);
          }
        } catch (e) {
          if (__DEV__) {
            console.warn("[ritual] insights persist before completeSession failed", e);
          }
        }
        completeSession({
          date: new Date().toDateString(),
          mood,
          closeness,
          type: "dhikr",
        });
        capture("dhikr_completed", {
          dhikr_id: selectedDhikr.id,
          dhikr_title: selectedDhikr.english,
          category: "ritual",
          duration_seconds: durationSeconds,
          dhikr_source: DHIKR_SOURCES[1],
          streak_count: state.streak,
          ...ritualEntryAnalytics,
        });
        void (async () => {
          const firstDone = await hasCompletedFirstDhikr();
          if (!firstDone) {
            capture("first_dhikr_completed", ritualEntryAnalytics);
            await markFirstDhikrCompleted();
          }
        })();
      })();
      setTimeout(() => setRitualStep("complete"), 300);
    }
  };

  const handleComplete = (type: "dhikr" | "dua") => {
    if (ritualOutcomeCommittedRef.current) return;
    ritualOutcomeCommittedRef.current = true;
    void (async () => {
      try {
        if (!isDirectFlow) {
          await recordSessionWellbeing(mood, closeness);
        }
      } catch (e) {
        if (__DEV__) {
          console.warn("[ritual] wellbeing persist before completeSession failed", e);
        }
      }
      completeSession({
        date: new Date().toDateString(),
        mood,
        closeness,
        type,
      });
      setRitualStep("complete");
    })();
  };

  const handleFinish = () => {
    router.back();
  };

  const directRitualSessionLogged = React.useRef(false);
  React.useEffect(() => {
    if (!isDirectFlow) return;
    if (directRitualSessionLogged.current) return;
    directRitualSessionLogged.current = true;
    void recordRitualSessionStarted();
    capture(
      "ritual_session_started",
      buildRitualEntryAnalytics(isDirectFlow, practice, guidedChosenPractice, entrySourceParam),
    );
  }, [isDirectFlow, flow, practice, entrySourceParam, guidedChosenPractice]);

  const directDhikrStartLogged = React.useRef(false);
  React.useEffect(() => {
    if (flow !== "direct" || practice !== "dhikr") return;
    if (directDhikrStartLogged.current) return;
    directDhikrStartLogged.current = true;
    capture("dhikr_started", {
      dhikr_id: "ritual_random",
      dhikr_title: "Random dhikr",
      category: "ritual",
      dhikr_source: DHIKR_SOURCES[1],
      ...buildRitualEntryAnalytics(true, practice, null, entrySourceParam),
    });
  }, [flow, practice, entrySourceParam]);

  const directDuaOpenedLogged = React.useRef(false);
  React.useEffect(() => {
    if (flow !== "direct" || practice !== "dua") return;
    if (directDuaOpenedLogged.current) return;
    directDuaOpenedLogged.current = true;
    capture("dua_started", {
      ...buildRitualEntryAnalytics(true, practice, null, entrySourceParam),
      dua_id: selectedDua?.id,
    });
  }, [flow, practice, entrySourceParam, selectedDua?.id]);

  React.useEffect(() => {
    screen("ritual", {
      ritual_step: ritualStep,
      ...buildRitualEntryAnalytics(
        isDirectFlow,
        practice,
        guidedChosenPractice,
        entrySourceParam
      ),
    });
  }, [ritualStep, isDirectFlow, practice, guidedChosenPractice, entrySourceParam]);

  React.useEffect(() => {
    if (ritualStep === "dhikr") {
      dhikrPressed.value = 0;
    }
  }, [ritualStep, dhikrPressed]);

  const dhikrCardPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - dhikrPressed.value * 0.012 }],
  }));

  const renderRitual = () => {
    switch (ritualStep) {
      case "intercept":
        return (
          <Animated.View entering={FadeIn.duration(500)} style={styles.centered}>
            <View style={styles.interceptGlow}>
              <Image
                source={mascots.tasbeeh}
                style={styles.mascot}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.interceptTitle}>Take 30 seconds{"\n"}before you continue.</Text>
            <Text style={styles.interceptSub}>
              A brief moment of remembrance{"\n"}before your feed.
            </Text>
            <PrimaryButton
              label="I'm ready"
              onPress={() => {
                void recordRitualSessionStarted();
                capture("ritual_session_started", ritualEntryAnalytics);
                setRitualStep("mood");
              }}
              style={styles.mainBtn}
            />
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.skipLink, { color: colors.mutedForeground }]}>Skip for now</Text>
            </Pressable>
          </Animated.View>
        );

      case "mood":
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <Text style={styles.sectionQuestion}>How are you feeling{"\n"}right now?</Text>
            <SliderInput value={mood} onChange={setMood} min={1} max={10} />
            <Text style={styles.moodLabel}>
              {mood <= 3 ? "Rough moment" : mood <= 6 ? "Getting by" : mood <= 8 ? "Pretty good" : "Wonderful"}
            </Text>
            <PrimaryButton
              label="Next"
              onPress={() => setRitualStep("closeness")}
              style={styles.mainBtn}
            />
          </Animated.View>
        );

      case "closeness":
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <Text style={styles.sectionQuestion}>How close to Allah{"\n"}do you feel right now?</Text>
            <SliderInput value={closeness} onChange={setCloseness} min={1} max={10} />
            <Text style={styles.moodLabel}>
              {closeness <= 3 ? "Distant" : closeness <= 6 ? "Somewhere between" : closeness <= 8 ? "Connected" : "Very close"}
            </Text>
            <PrimaryButton
              label="Next"
              onPress={() => setRitualStep("choose")}
              style={styles.mainBtn}
            />
          </Animated.View>
        );

      case "choose":
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <Text style={styles.sectionQuestion}>Choose your{"\n"}practice.</Text>
            <Text style={styles.chooseSub}>Both take under 30 seconds.</Text>
            <View style={styles.chooseGrid}>
              <Pressable
                style={styles.chooseCard}
                onPress={handleSelectDhikr}
              >
                <LinearGradient
                  colors={["#2d1a4a", "#3d2460"]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                />
                <View style={styles.chooseIconClip}>
                  <Image
                    source={mascots.tasbeeh}
                    style={styles.chooseIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.chooseTitle}>Dhikr</Text>
                <Text style={styles.chooseSub2}>Remembrance with{"\n"}prayer beads</Text>
              </Pressable>
              <Pressable
                style={styles.chooseCard}
                onPress={handleSelectDua}
              >
                <LinearGradient
                  colors={["#2d1a4a", "#3d2460"]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                />
                <Ionicons name="book-outline" size={50} color="#F5C842" />
                <Text style={styles.chooseTitle}>Dua</Text>
                <Text style={styles.chooseSub2}>A short supplication{"\n"}from the Quran</Text>
              </Pressable>
            </View>
          </Animated.View>
        );

      case "dhikr":
        if (!selectedDhikr) {
          return null;
        }

        const progress = dhikrCount / selectedDhikr.count;
        const dhikrComplete = dhikrCount >= selectedDhikr.count;
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.dhikrStepRoot}>
            <Pressable
              style={styles.dhikrFullTap}
              disabled={dhikrComplete}
              onPress={handleDhikrTap}
              onPressIn={() => {
                if (dhikrComplete) return;
                dhikrPressed.value = withTiming(1, {
                  duration: 100,
                  easing: Easing.out(Easing.cubic),
                });
              }}
              onPressOut={() => {
                dhikrPressed.value = withTiming(0, {
                  duration: 220,
                  easing: Easing.out(Easing.cubic),
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Tap once for each recitation, up to ${selectedDhikr.count} times`}
              accessibilityState={{ disabled: dhikrComplete }}
            >
              <View style={styles.dhikrHeaderRow}>
                <View style={styles.dhikrLogoArt}>
                  <View style={styles.dhikrLogoGlow} />
                  <View style={styles.dhikrLogoFrame}>
                    <LinearGradient
                      colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)"]}
                      style={styles.dhikrLogoSheen}
                    />
                    <MascotImage
                      variant="tasbeeh"
                      size={DHIKR_LOGO_BOX}
                      resizeMode="cover"
                      style={styles.dhikrLogoImage}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.dhikrMiddle}>
                <View style={styles.dhikrCardHintStack}>
                  <View style={styles.dhikrCardStage}>
                    <View style={styles.dhikrGlowHalo} pointerEvents="none" />
                    <View style={styles.dhikrCardPressable}>
                      <Animated.View
                        style={[
                          onboardingStyles.verseCard,
                          styles.dhikrVerseCardElevated,
                          dhikrCardPressStyle,
                        ]}
                      >
                        <Text style={styles.dhikrVerseArabic}>{selectedDhikr.arabic}</Text>
                        <Text
                          style={[
                            onboardingStyles.verseTranslation,
                            styles.dhikrVerseTranslationSoft,
                          ]}
                        >
                          {selectedDhikr.english}
                        </Text>
                        <Text style={styles.dhikrRepeatLine}>
                          Repeat {selectedDhikr.count} times
                        </Text>
                        <Text style={styles.dhikrCounterInCard}>
                          {dhikrCount} of {selectedDhikr.count}
                        </Text>
                      </Animated.View>
                    </View>
                  </View>
                  <Text style={[onboardingStyles.stepSub, styles.dhikrTapHintOnboarding]}>
                    Tap anywhere to count your dhikr
                  </Text>
                  <View style={styles.dhikrProgressBar}>
                    <View style={[styles.dhikrProgressFill, { width: `${progress * 100}%` }]} />
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );

      case "dua":
        if (!selectedDua) {
          return null;
        }

        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <Text style={styles.sectionQuestion}>Read slowly.{"\n"}Let it sink in.</Text>
            <View style={styles.duaCard}>
              <Text style={styles.duaArabic}>{selectedDua.arabic}</Text>
              <View style={styles.divider} />
              <Text style={styles.duaEnglish}>{selectedDua.english}</Text>
              <Text style={styles.duaRef}>{selectedDua.reference}</Text>
            </View>
            <PrimaryButton
              label="I've read it"
              onPress={() => handleComplete("dua")}
              style={styles.mainBtn}
            />
          </Animated.View>
        );

      case "complete": {
        const completeTitle = isDirectFlow
          ? practice === "dua"
            ? `A quiet moment${"\n"}well spent.`
            : `Your dhikr${"\n"}is complete.`
          : `A small return${"\n"}is still a return.`;
        const completeSub = isDirectFlow
          ? practice === "dua"
            ? "Thank you for reading with intention."
            : "May Allah accept your remembrance."
          : "You chose faith first. That matters.";

        return (
          <Animated.View entering={ZoomIn.duration(500)} style={styles.centered}>
            <View style={styles.completionArt}>
              <View style={styles.completionGlow} />
              <View style={styles.completionGlowWarm} />
              <View style={styles.completionSparkleLeft} />
              <View style={styles.completionSparkleRight} />
              <View style={styles.completionFrame}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)"]}
                  style={styles.completionFrameSheen}
                />
                <MascotImage
                  variant="celebrate"
                  size={248}
                  float
                  resizeMode="cover"
                  style={styles.completionMascot}
                />
              </View>
            </View>
            <Text style={styles.completeTitle}>{completeTitle}</Text>
            <Text style={styles.completeSub}>{completeSub}</Text>
            <PrimaryButton
              label="Continue"
              onPress={handleFinish}
              style={styles.mainBtn}
            />
          </Animated.View>
        );
      }
    }
  };

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="rgba(196,162,247,0.5)" />
          </Pressable>
        </View>
        <ScrollView
          scrollEnabled={ritualStep !== "dhikr"}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderRitual()}
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    minHeight: 500,
  },
  mascot: {
    width: 140,
    height: 140,
  },
  interceptGlow: {
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  interceptTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 38,
  },
  interceptSub: {
    fontSize: 15,
    color: "rgba(196,162,247,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  mainBtn: {
    width: 280,
  },
  skipLink: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sectionQuestion: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 36,
  },
  moodLabel: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#C4A2F7",
  },
  chooseSub: {
    fontSize: 14,
    color: "rgba(155,128,200,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  chooseGrid: {
    flexDirection: "row",
    gap: 14,
  },
  chooseCard: {
    width: 150,
    height: 200,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
  },
  chooseIconClip: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  chooseIcon: {
    width: 60,
    height: 60,
  },
  chooseTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  chooseSub2: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  dhikrStepRoot: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minHeight: 480,
    paddingTop: 8,
  },
  dhikrFullTap: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    minHeight: 440,
  },
  dhikrMiddle: {
    flex: 1,
    minHeight: 280,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dhikrCardHintStack: {
    width: "100%",
    alignItems: "center",
    gap: 28,
    paddingBottom: 8,
  },
  dhikrCardStage: {
    position: "relative",
    width: "100%",
    maxWidth: 356,
    alignSelf: "center",
    alignItems: "center",
  },
  dhikrGlowHalo: {
    position: "absolute",
    left: 4,
    right: 4,
    top: 6,
    bottom: 6,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.42)",
    backgroundColor: "rgba(196,162,247,0.06)",
    shadowColor: "#B89AF0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  dhikrCardPressable: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  dhikrVerseCardElevated: {
    paddingVertical: 26,
    paddingHorizontal: 26,
    gap: 11,
    shadowColor: "#C9B2EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.22)",
    backgroundColor: "rgba(38,22,62,0.78)",
  },
  dhikrVerseArabic: {
    fontSize: 32,
    color: "#F5C842",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 46,
    marginTop: 0,
    marginBottom: 4,
    textShadowColor: "rgba(245,200,66,0.35)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  dhikrVerseTranslationSoft: {
    color: "rgba(232,226,248,0.76)",
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginTop: 1,
  },
  dhikrRepeatLine: {
    fontSize: 14,
    color: "rgba(228,218,252,0.68)",
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 0,
  },
  dhikrCounterInCard: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(244,238,255,0.88)",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  dhikrTapHintOnboarding: {
    marginTop: 0,
    paddingHorizontal: 12,
    color: "rgba(208,188,248,0.82)",
  },
  dhikrHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    gap: 14,
    marginBottom: 4,
  },
  dhikrLogoArt: {
    width: DHIKR_LOGO_BOX,
    height: DHIKR_LOGO_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  dhikrLogoGlow: {
    position: "absolute",
    width: DHIKR_LOGO_GLOW,
    height: DHIKR_LOGO_GLOW,
    borderRadius: 999,
    backgroundColor: "rgba(164,120,235,0.14)",
    shadowColor: "#A478EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dhikrLogoFrame: {
    width: DHIKR_LOGO_BOX,
    height: DHIKR_LOGO_BOX,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5E3A86",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  dhikrLogoSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  dhikrLogoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#5E3A86",
  },
  dhikrProgressBar: {
    width: "100%",
    maxWidth: 340,
    height: 4,
    backgroundColor: "rgba(196,162,247,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  dhikrProgressFill: {
    height: "100%",
    backgroundColor: "#F5C842",
    borderRadius: 2,
  },
  duaCard: {
    backgroundColor: "rgba(45,26,74,0.7)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.2)",
    padding: 28,
    width: "100%",
    gap: 14,
    alignItems: "center",
  },
  duaArabic: {
    width: "100%",
    fontSize: 24,
    color: "#F5C842",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 42,
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "rgba(196,162,247,0.1)",
  },
  duaEnglish: {
    width: "100%",
    color: "#f0eaff",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  duaRef: {
    color: "#9b80c8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  completionArt: {
    width: 252,
    height: 252,
    alignItems: "center",
    justifyContent: "center",
  },
  completionGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(164,120,235,0.18)",
    shadowColor: "#A478EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
  },
  completionGlowWarm: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 999,
    backgroundColor: "rgba(245,200,66,0.12)",
  },
  completionFrame: {
    width: 248,
    height: 248,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#694094",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  completionFrameSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  completionMascot: {
    width: "100%",
    height: "100%",
    backgroundColor: "#694094",
  },
  completionSparkleLeft: {
    position: "absolute",
    top: 34,
    left: 28,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(245,200,66,0.3)",
  },
  completionSparkleRight: {
    position: "absolute",
    right: 32,
    bottom: 42,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  completeTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    textAlign: "center",
    lineHeight: 40,
  },
  completeSub: {
    fontSize: 16,
    color: "rgba(196,162,247,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
