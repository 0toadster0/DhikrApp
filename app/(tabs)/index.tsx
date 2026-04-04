import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/components/GradientBackground";
import { MascotImage } from "@/components/MascotImage";
import { useApp } from "@/context/AppContext";

const DAILY_VERSES = [
  {
    arabic: "وَلَذِكْرُ اللَّهِ أَكْبَرُ",
    translit: "Wa ladhikru-Llāhi akbar",
    meaning: "And the remembrance of Allah is greatest.",
    ref: "Quran 29:45",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translit: "Alā bi-dhikri-Llāhi taṭma'innu-l-qulūb",
    meaning: "Verily, in the remembrance of Allah do hearts find rest.",
    ref: "Quran 13:28",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translit: "Fa-dhkurūnī adhkurkum",
    meaning: "Remember Me, and I will remember you.",
    ref: "Quran 2:152",
  },
];

const HERO_MASCOT_BOX = 168;
const HERO_GLOW = Math.round((248 / 272) * HERO_MASCOT_BOX);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const dayIndex = new Date().getDay() % DAILY_VERSES.length;
  const verse = DAILY_VERSES[dayIndex];

  const today = new Date().toDateString();
  const todaySessions = state.sessions.filter(
    (s) => s.date === today
  );
  const completedToday = todaySessions.length > 0;

  return (
    <GradientBackground style={{ flex: 1 }} variant="mid">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding + 8, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 17
                ? "Good afternoon"
                : "Good evening"}
              {state.profile.name?.trim() ? `, ${state.profile.name.trim()}` : ""}
            </Text>
            <View style={styles.headerHeadlineRow}>
              <View style={styles.headerSubWrap}>
                <Text style={styles.headerSub}>
                  It's a good day to choose faith first
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={18} color="#F5C842" />
                <Text style={styles.streakNum}>{state.streak}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroMascotWrap}>
              <View style={styles.heroGlow} />
              <View style={styles.heroFrame}>
                <MascotImage
                  variant="hero"
                  size={HERO_MASCOT_BOX}
                  float
                  pulse
                  resizeMode="contain"
                  style={styles.heroMascot}
                />
              </View>
            </View>
            {completedToday ? (
              <View style={styles.completedBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#C4A2F7" />
                <Text style={styles.completedText}>Ritual complete for today</Text>
              </View>
            ) : (
              <Text style={styles.mascotCta}>A quiet moment before you begin.</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.verseCard}>
          <LinearGradient
            colors={["rgba(245,200,66,0.08)", "rgba(45,26,74,0.8)"]}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          <View style={styles.verseTagRow}>
            <Ionicons name="book-outline" size={14} color="#F5C842" />
            <Text style={styles.verseTag}>Verse of the Day</Text>
          </View>
          <Text style={styles.verseArabic}>{verse.arabic}</Text>
          <Text style={styles.verseTranslit}>{verse.translit}</Text>
          <Text style={styles.verseMeaning}>{verse.meaning}</Text>
          <Text style={styles.verseRef}>{verse.ref}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.actionRow}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push("/ritual")}
          >
            <LinearGradient
              colors={["#6B3FA0", "#9B6FE8"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.actionIconBadge}>
              <Ionicons name="sparkles" size={26} color="#F5C842" />
            </View>
            <Text style={styles.actionLabel}>Start Dhikr</Text>
            <Text style={styles.actionSub}>30 seconds</Text>
          </Pressable>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push("/ritual")}
          >
            <LinearGradient
              colors={["#2a1050", "#3d2460"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />
            <Ionicons name="book-outline" size={40} color="#F5C842" />
            <Text style={styles.actionLabel}>Read a Dua</Text>
            <Text style={styles.actionSub}>Under 30 sec</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionTitle}>Protected Apps</Text>
          <View style={styles.protectedRow}>
            {(state.profile.appsToBlock.length > 0
              ? state.profile.appsToBlock.slice(0, 4)
              : ["instagram", "tiktok", "twitter"]
            ).map((app) => (
              <View key={app} style={styles.appPill}>
                <Ionicons
                  name={
                    app === "instagram"
                      ? "logo-instagram"
                      : app === "tiktok"
                      ? "musical-notes"
                      : app === "twitter"
                      ? "logo-twitter"
                      : "apps"
                  }
                  size={18}
                  color="#C4A2F7"
                />
                <Text style={styles.appPillText}>
                  {app.charAt(0).toUpperCase() + app.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {state.streak > 0 && (
          <Animated.View
            entering={FadeInDown.duration(500).delay(600)}
            style={styles.streakCard}
          >
            <LinearGradient
              colors={["rgba(245,200,66,0.08)", "rgba(45,26,74,0.6)"]}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>{state.streak}-day streak</Text>
              <Text style={styles.streakSub}>
                Longest: {state.longestStreak} days
              </Text>
            </View>
            <Ionicons name="flame" size={32} color="#F5C842" />
          </Animated.View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  header: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(196,162,247,0.7)",
    fontFamily: "Inter_400Regular",
  },
  headerHeadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerSubWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerSub: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,200,66,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.2)",
  },
  streakNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#F5C842",
  },
  verseCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.15)",
    padding: 14,
    gap: 6,
    overflow: "hidden",
  },
  verseTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verseTag: {
    fontSize: 12,
    color: "#F5C842",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  verseArabic: {
    fontSize: 22,
    color: "#f0eaff",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    lineHeight: 30,
  },
  verseTranslit: {
    fontSize: 13,
    color: "rgba(196,162,247,0.7)",
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  verseMeaning: {
    fontSize: 15,
    color: "rgba(240,234,255,0.9)",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  verseRef: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
  },
  heroSection: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  heroContent: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  heroMascotWrap: {
    width: HERO_MASCOT_BOX,
    height: HERO_MASCOT_BOX,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 2,
  },
  heroGlow: {
    position: "absolute",
    width: HERO_GLOW,
    height: HERO_GLOW,
    borderRadius: 999,
    backgroundColor: "rgba(196,162,247,0.18)",
    shadowColor: "#C4A2F7",
    shadowOpacity: 0.28,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  heroFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5F2F96",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
  },
  heroMascot: {
    width: "100%",
    height: "100%",
    backgroundColor: "#5F2F96",
  },
  mascotCta: {
    fontSize: 15,
    color: "rgba(196,162,247,0.8)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(196,162,247,0.08)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  completedText: {
    fontSize: 14,
    color: "#C4A2F7",
    fontFamily: "Inter_500Medium",
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
  },
  actionCard: {
    flex: 1,
    height: 160,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.1)",
  },
  actionIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245,200,66,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  actionSub: {
    fontSize: 12,
    color: "rgba(196,162,247,0.7)",
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#f0eaff",
    marginBottom: 10,
  },
  protectedRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  appPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(45,26,74,0.6)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
  },
  appPillText: {
    fontSize: 13,
    color: "#C4A2F7",
    fontFamily: "Inter_500Medium",
  },
  streakCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.15)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  streakSub: {
    fontSize: 13,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
