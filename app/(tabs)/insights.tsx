import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/components/GradientBackground";
import { MascotImage } from "@/components/MascotImage";
import { useApp } from "@/context/AppContext";
import { loadWeeklyInsights, type WeeklyInsights } from "@/lib/insightsLocal";

const defaultWeekly: WeeklyInsights = {
  dhikrCount: 0,
  duaCount: 0,
  weekActivity: [false, false, false, false, false, false, false],
  streak: 0,
  longestStreak: 0,
  avgMood: "–",
  avgCloseness: "–",
  showEmptyState: true,
};

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const [weekly, setWeekly] = useState<WeeklyInsights>(defaultWeekly);

  const refresh = useCallback(() => {
    // Guided ritual awaits insights persistence before advancing; onboarding demo does not write Insights.
    void loadWeeklyInsights(state.sessions).then(setWeekly);
  }, [state.sessions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const { dhikrCount, duaCount, avgMood, avgCloseness, weekActivity, streak, longestStreak, showEmptyState } =
    weekly;

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Your Insights</Text>
            <Text style={styles.sub}>Past 7 days</Text>
          </View>
          <View style={styles.headerMascotWrap}>
            <View style={styles.headerMascotGlow} />
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "rgba(196,162,247,0.03)"]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.headerMascotFrame}
            >
              <MascotImage
                variant="mag"
                size={64}
                resizeMode="cover"
                style={styles.headerMascot}
              />
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.statsRow}>
          <StatCard icon="sparkles" label="Dhikr" value={dhikrCount.toString()} color="#C4A2F7" />
          <StatCard icon="book-outline" label="Duas" value={duaCount.toString()} color="#F5C842" />
          <StatCard icon="flame" label="Streak" value={`${streak}d`} color="#F5C842" />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.weekCard}>
          <LinearGradient
            colors={["rgba(45,26,74,0.9)", "rgba(61,36,96,0.8)"]}
            style={StyleSheet.absoluteFill}
            borderRadius={20}
          />
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekDot,
                    weekActivity[i] && styles.weekDotActive,
                  ]}
                />
                <Text style={styles.weekDayLabel}>{d}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.moodCard}>
          <LinearGradient
            colors={["rgba(45,26,74,0.8)", "rgba(26,10,46,0.9)"]}
            style={StyleSheet.absoluteFill}
            borderRadius={20}
          />
          <Text style={styles.cardTitle}>Wellbeing Averages</Text>
          <View style={styles.moodRow}>
            <View style={styles.moodItem}>
              <Text style={styles.moodValue}>{avgMood}</Text>
              <Text style={styles.moodLabel}>Avg Mood</Text>
              <Text style={styles.moodScale}>out of 10</Text>
            </View>
            <View style={styles.moodDivider} />
            <View style={styles.moodItem}>
              <Text style={styles.moodValue}>{avgCloseness}</Text>
              <Text style={styles.moodLabel}>Avg Closeness</Text>
              <Text style={styles.moodScale}>to Allah</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.streakCard}>
          <LinearGradient
            colors={["rgba(245,200,66,0.07)", "rgba(45,26,74,0.8)"]}
            style={StyleSheet.absoluteFill}
            borderRadius={20}
          />
          <Ionicons name="flame" size={28} color="#F5C842" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakMain}>
              {streak > 0 ? `${streak}-day streak` : "Build your streak"}
            </Text>
            <Text style={styles.streakSub}>
              {longestStreak > 0
                ? `Longest: ${longestStreak} days`
                : "One day per finished dhikr or dua"}
            </Text>
          </View>
        </Animated.View>

        {showEmptyState && (
          <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Finish dhikr or read a dua to see insights here.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <LinearGradient
        colors={["rgba(45,26,74,0.9)", "rgba(26,10,46,0.8)"]}
        style={StyleSheet.absoluteFill}
        borderRadius={16}
      />
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  sub: {
    fontSize: 14,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerMascotWrap: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMascotGlow: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(196,162,247,0.08)",
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 0,
  },
  headerMascotFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(32,14,54,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 0,
  },
  headerMascot: {
    width: "112%",
    height: "112%",
    // Was translateY: 56 — pushes the bitmap past overflow:hidden on a 112px-tall frame (mascot clipped away).
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    padding: 16,
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  statLabel: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
  },
  weekCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    padding: 20,
    gap: 16,
    overflow: "hidden",
  },
  weekTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#f0eaff",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDay: {
    alignItems: "center",
    gap: 6,
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(196,162,247,0.1)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
  },
  weekDotActive: {
    backgroundColor: "#C4A2F7",
    borderColor: "#C4A2F7",
  },
  weekDayLabel: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
  },
  moodCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.12)",
    padding: 22,
    gap: 16,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#f0eaff",
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  moodItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  moodValue: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#C4A2F7",
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#f0eaff",
  },
  moodScale: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
  },
  moodDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(196,162,247,0.12)",
  },
  streakCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,200,66,0.15)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  streakInfo: {
    flex: 1,
  },
  streakMain: {
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 15,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
