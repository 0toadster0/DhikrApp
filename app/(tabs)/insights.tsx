import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/components/GradientBackground";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const sessions = state.sessions;
  const last7Days = sessions.filter((s) => {
    const d = new Date(s.completedAt);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const dhikrCount = last7Days.filter((s) => s.type === "dhikr").length;
  const duaCount = last7Days.filter((s) => s.type === "dua").length;
  const avgMood =
    last7Days.length > 0
      ? (last7Days.reduce((a, s) => a + s.mood, 0) / last7Days.length).toFixed(1)
      : "–";
  const avgCloseness =
    last7Days.length > 0
      ? (last7Days.reduce((a, s) => a + s.closeness, 0) / last7Days.length).toFixed(1)
      : "–";

  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date().getDay();
  const weekActivity = DAYS.map((_, i) => {
    const dayOffset = (today - (6 - i) + 7) % 7;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - (6 - i));
    return sessions.some(
      (s) => new Date(s.completedAt).toDateString() === checkDate.toDateString()
    );
  });

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 12, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.title}>Your Insights</Text>
          <Text style={styles.sub}>Past 7 days</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.statsRow}>
          <StatCard icon="sparkles" label="Dhikr" value={dhikrCount.toString()} color="#C4A2F7" />
          <StatCard icon="book-outline" label="Duas" value={duaCount.toString()} color="#F5C842" />
          <StatCard icon="flame" label="Streak" value={`${state.streak}d`} color="#F5C842" />
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
              {state.streak > 0 ? `${state.streak}-day streak` : "Start your streak"}
            </Text>
            <Text style={styles.streakSub}>Longest: {state.longestStreak} days</Text>
          </View>
        </Animated.View>

        {sessions.length === 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.emptyState}>
            <Text style={styles.emptyText}>Complete your first ritual to see insights here.</Text>
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
