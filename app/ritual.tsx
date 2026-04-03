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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
} from "@/lib/analytics";

type RitualStep = "intercept" | "mood" | "closeness" | "choose" | "dhikr" | "dua" | "complete";

let lastShownRitualDuaId: Dua["id"] | undefined;
let lastShownRitualDhikrId: BlockedDhikr["id"] | undefined;

export default function RitualScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { completeSession, state } = useApp();

  const [ritualStep, setRitualStep] = useState<RitualStep>("intercept");
  const [mood, setMood] = useState(5);
  const [closeness, setCloseness] = useState(5);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<BlockedDhikr | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [dhikrStartedAt, setDhikrStartedAt] = useState<number | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSelectDhikr = () => {
    setSelectedDua(null);
    setDhikrCount(0);
    setSelectedDhikr(() => {
      try {
        const nextDhikr = getRandomBlockedDhikr(lastShownRitualDhikrId);
        lastShownRitualDhikrId = nextDhikr.id;

        return nextDhikr;
      } catch {
        const fallbackDhikr = BLOCKED_DHIKR[0] ?? null;
        lastShownRitualDhikrId = fallbackDhikr?.id;

        return fallbackDhikr;
      }
    });
    capture("dhikr_started", {
      dhikr_id: "ritual_random",
      dhikr_title: "Random dhikr",
      category: "ritual",
      dhikr_source: DHIKR_SOURCES[1],
    });
    setDhikrStartedAt(Date.now());
    setRitualStep("dhikr");
  };

  const handleSelectDua = () => {
    setSelectedDhikr(null);
    setSelectedDua(() => {
      try {
        const nextDua = getRandomDua(lastShownRitualDuaId);
        lastShownRitualDuaId = nextDua.id;

        return nextDua;
      } catch {
        const fallbackDua = QURANIC_DUAS[0] ?? null;
        lastShownRitualDuaId = fallbackDua?.id;

        return fallbackDua;
      }
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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCount = dhikrCount + 1;
    setDhikrCount(newCount);

    if (newCount >= selectedDhikr.count) {
      const durationSeconds = dhikrStartedAt
        ? Math.max(1, Math.round((Date.now() - dhikrStartedAt) / 1000))
        : null;
      capture("dhikr_completed", {
        dhikr_id: selectedDhikr.id,
        dhikr_title: selectedDhikr.english,
        category: "ritual",
        duration_seconds: durationSeconds,
        dhikr_source: DHIKR_SOURCES[1],
        streak_count: state.streak,
      });
      void (async () => {
        const firstDone = await hasCompletedFirstDhikr();
        if (!firstDone) {
          capture("first_dhikr_completed");
          await markFirstDhikrCompleted();
        }
      })();
      setTimeout(() => setRitualStep("complete"), 300);
    }
  };

  const handleComplete = (type: "dhikr" | "dua") => {
    completeSession({
      date: new Date().toDateString(),
      mood,
      closeness,
      type,
    });
    setRitualStep("complete");
  };

  const handleFinish = () => {
    router.back();
  };

  React.useEffect(() => {
    screen("ritual", { ritual_step: ritualStep });
  }, [ritualStep]);

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
              onPress={() => setRitualStep("mood")}
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
                <Image
                  source={mascots.tasbeeh}
                  style={styles.chooseIcon}
                  resizeMode="contain"
                />
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
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <View style={styles.dhikrMascotArt}>
              <View style={styles.dhikrMascotGlow} />
              <View style={styles.dhikrMascotWarmth} />
              <View style={styles.dhikrMascotFrame}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)"]}
                  style={styles.dhikrMascotSheen}
                />
                <MascotImage
                  variant="tasbeeh"
                  size={228}
                  float
                  resizeMode="cover"
                  style={styles.dhikrMascotImage}
                />
              </View>
            </View>
            <Text style={styles.dhikrProgress}>
              {dhikrCount} / {selectedDhikr.count}
            </Text>
            <Pressable
              style={styles.dhikrTapArea}
              onPress={handleDhikrTap}
            >
              <LinearGradient
                colors={["rgba(107,63,160,0.3)", "rgba(196,162,247,0.1)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 120 }]}
              />
              <Text style={styles.dhikrArabic}>{selectedDhikr.arabic}</Text>
              <Text style={styles.dhikrMeaning}>{selectedDhikr.english}</Text>
              <Text style={styles.dhikrTarget}>Repeat {selectedDhikr.count} times</Text>
              <Text style={styles.tapHint}>Tap to count</Text>
            </Pressable>
            <View style={styles.dhikrProgressBar}>
              <View style={[styles.dhikrProgressFill, { width: `${progress * 100}%` }]} />
            </View>
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

      case "complete":
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
            <Text style={styles.completeTitle}>A small return{"\n"}is still a return.</Text>
            <Text style={styles.completeSub}>
              You chose faith first. That matters.
            </Text>
            <PrimaryButton
              label="Continue"
              onPress={handleFinish}
              style={styles.mainBtn}
            />
          </Animated.View>
        );
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
  dhikrProgress: {
    fontSize: 14,
    color: "#9b80c8",
    fontFamily: "Inter_500Medium",
  },
  dhikrMascotArt: {
    width: 228,
    height: 228,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dhikrMascotGlow: {
    position: "absolute",
    width: 196,
    height: 196,
    borderRadius: 999,
    backgroundColor: "rgba(164,120,235,0.12)",
    shadowColor: "#A478EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  dhikrMascotWarmth: {
    position: "absolute",
    width: 154,
    height: 154,
    borderRadius: 999,
    backgroundColor: "rgba(245,200,66,0.08)",
  },
  dhikrMascotFrame: {
    width: 228,
    height: 228,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5E3A86",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  dhikrMascotSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  dhikrMascotImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#5E3A86",
  },
  dhikrTapArea: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.2)",
  },
  dhikrArabic: {
    fontSize: 28,
    color: "#f0eaff",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 40,
  },
  dhikrMeaning: {
    fontSize: 13,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  dhikrTarget: {
    fontSize: 12,
    color: "#C4A2F7",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  tapHint: {
    fontSize: 11,
    color: "rgba(155,128,200,0.5)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  dhikrProgressBar: {
    width: 240,
    height: 4,
    backgroundColor: "rgba(196,162,247,0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  dhikrProgressFill: {
    height: "100%",
    backgroundColor: "#C4A2F7",
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
