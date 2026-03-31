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
import { PrimaryButton } from "@/components/PrimaryButton";
import { SliderInput } from "@/components/SliderInput";
import { QURANIC_DUAS, type Dua } from "@/constants/quranicDuas";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { getRandomDua } from "@/utils/getRandomDua";

type RitualStep = "intercept" | "mood" | "closeness" | "choose" | "dhikr" | "dua" | "complete";

let lastShownRitualDuaId: Dua["id"] | undefined;

const DHIKR_ITEMS = [
  {
    arabic: "سُبْحَانَ اللَّهِ",
    translit: "Subhāna-Llāh",
    meaning: "Glory be to Allah",
    count: 33,
  },
  {
    arabic: "الحَمْدُ لِلَّهِ",
    translit: "Al-hamdu li-Llāh",
    meaning: "All praise is to Allah",
    count: 33,
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    translit: "Allāhu akbar",
    meaning: "Allah is the Greatest",
    count: 34,
  },
];

export default function RitualScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { completeSession } = useApp();

  const [ritualStep, setRitualStep] = useState<RitualStep>("intercept");
  const [mood, setMood] = useState(5);
  const [closeness, setCloseness] = useState(5);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [selectedDua] = useState<Dua>(() => {
    try {
      const nextDua = getRandomDua(lastShownRitualDuaId);
      lastShownRitualDuaId = nextDua.id;

      return nextDua;
    } catch {
      const fallbackDua = QURANIC_DUAS[0];
      lastShownRitualDuaId = fallbackDua?.id;

      return fallbackDua;
    }
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const totalDhikrCount = DHIKR_ITEMS.reduce((acc, d) => acc + d.count, 0);

  const handleDhikrTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCount = dhikrCount + 1;
    setDhikrCount(newCount);

    let cumulative = 0;
    for (let i = 0; i < DHIKR_ITEMS.length; i++) {
      cumulative += DHIKR_ITEMS[i].count;
      if (newCount <= cumulative) {
        setDhikrIndex(i);
        break;
      }
    }

    if (newCount >= totalDhikrCount) {
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

  const renderRitual = () => {
    switch (ritualStep) {
      case "intercept":
        return (
          <Animated.View entering={FadeIn.duration(500)} style={styles.centered}>
            <View style={styles.interceptGlow}>
              <Image
                source={require("@/assets/mascot/mascot_default.png")}
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
                onPress={() => setRitualStep("dhikr")}
              >
                <LinearGradient
                  colors={["#2d1a4a", "#3d2460"]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={20}
                />
                <Image
                  source={require("@/assets/mascot/mascot_tasbeeh.png")}
                  style={styles.chooseIcon}
                  resizeMode="contain"
                />
                <Text style={styles.chooseTitle}>Dhikr</Text>
                <Text style={styles.chooseSub2}>Remembrance with{"\n"}prayer beads</Text>
              </Pressable>
              <Pressable
                style={styles.chooseCard}
                onPress={() => setRitualStep("dua")}
              >
                <LinearGradient
                  colors={["#2d1a4a", "#3d2460"]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={20}
                />
                <Ionicons name="book-outline" size={50} color="#F5C842" />
                <Text style={styles.chooseTitle}>Dua</Text>
                <Text style={styles.chooseSub2}>A short supplication{"\n"}from the Quran</Text>
              </Pressable>
            </View>
          </Animated.View>
        );

      case "dhikr":
        const currentDhikr = DHIKR_ITEMS[dhikrIndex];
        const progress = dhikrCount / totalDhikrCount;
        return (
          <Animated.View entering={FadeIn.duration(400)} style={styles.centered}>
            <Text style={styles.dhikrProgress}>
              {dhikrCount} / {totalDhikrCount}
            </Text>
            <Pressable
              style={styles.dhikrTapArea}
              onPress={handleDhikrTap}
            >
              <LinearGradient
                colors={["rgba(107,63,160,0.3)", "rgba(196,162,247,0.1)"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 120 }]}
              />
              <Text style={styles.dhikrArabic}>{currentDhikr.arabic}</Text>
              <Text style={styles.dhikrTranslit}>{currentDhikr.translit}</Text>
              <Text style={styles.dhikrMeaning}>{currentDhikr.meaning}</Text>
              <Text style={styles.tapHint}>Tap to count</Text>
            </Pressable>
            <View style={styles.dhikrProgressBar}>
              <View style={[styles.dhikrProgressFill, { width: `${progress * 100}%` }]} />
            </View>
          </Animated.View>
        );

      case "dua":
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
            <View style={styles.completionGlow}>
              <Image
                source={require("@/assets/mascot/mascot_celebration.png")}
                style={styles.mascotLarge}
                resizeMode="contain"
              />
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
  mascotLarge: {
    width: 180,
    height: 180,
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
    lineHeight: 40,
  },
  dhikrTranslit: {
    fontSize: 14,
    color: "#C4A2F7",
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
  },
  dhikrMeaning: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
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
  completionGlow: {
    shadowColor: "#F5C842",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
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
