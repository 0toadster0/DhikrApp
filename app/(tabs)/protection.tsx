import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { GradientBackground } from "@/components/GradientBackground";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { capture, screen } from "@/lib/analytics";

const ALL_APPS = [
  { id: "instagram", label: "Instagram", icon: "logo-instagram" as const },
  { id: "tiktok", label: "TikTok", icon: "musical-notes" as const },
  { id: "twitter", label: "X / Twitter", icon: "logo-twitter" as const },
  { id: "youtube", label: "YouTube", icon: "logo-youtube" as const },
  { id: "reddit", label: "Reddit", icon: "logo-reddit" as const },
  { id: "snapchat", label: "Snapchat", icon: "camera" as const },
  { id: "facebook", label: "Facebook", icon: "logo-facebook" as const },
  { id: "whatsapp", label: "WhatsApp", icon: "chatbubble-ellipses" as const },
  { id: "telegram", label: "Telegram", icon: "paper-plane" as const },
  { id: "netflix", label: "Netflix", icon: "play-circle" as const },
];

export default function ProtectionScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state, updateProfile } = useApp();
  const [blocked, setBlocked] = useState<string[]>(
    state.profile.appsToBlock.length > 0
      ? state.profile.appsToBlock
      : ["instagram", "tiktok", "twitter"]
  );
  const initialBlockedRef = useRef<string[]>(blocked);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = blocked.includes(id)
      ? blocked.filter((a) => a !== id)
      : [...blocked, id];
    setBlocked(updated);
    updateProfile({ appsToBlock: updated });
  };

  useEffect(() => {
    capture("app_blocking_setup_started");
    screen("protection_setup");
  }, []);

  useEffect(() => {
    return () => {
      const initial = initialBlockedRef.current;
      const changed =
        initial.length !== blocked.length ||
        initial.some((appId) => !blocked.includes(appId));
      if (changed) {
        capture("app_blocking_setup_completed", {
          selected_blocked_apps_count: blocked.length,
        });
      }
    };
  }, [blocked]);

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
          <Text style={styles.title}>Protected Apps</Text>
          <Text style={styles.sub}>
            These apps require your ritual before opening.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.infoCard}>
          <LinearGradient
            colors={["rgba(196,162,247,0.08)", "rgba(45,26,74,0.7)"]}
            style={StyleSheet.absoluteFill}
            borderRadius={20}
          />
          <Ionicons name="shield-checkmark" size={28} color="#C4A2F7" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{blocked.length} apps protected</Text>
            <Text style={styles.infoSub}>
              Each blocked app requires a 30-second ritual before access is granted.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionLabel}>Choose apps to protect</Text>
          <View style={styles.appList}>
            {ALL_APPS.map((app) => {
              const isBlocked = blocked.includes(app.id);
              return (
                <Pressable
                  key={app.id}
                  style={[
                    styles.appRow,
                    isBlocked && styles.appRowActive,
                    { borderColor: isBlocked ? colors.primary : colors.border },
                  ]}
                  onPress={() => toggle(app.id)}
                >
                  <LinearGradient
                    colors={
                      isBlocked
                        ? ["rgba(196,162,247,0.1)", "rgba(107,63,160,0.08)"]
                        : ["rgba(45,26,74,0.5)", "rgba(26,10,46,0.4)"]
                    }
                    style={StyleSheet.absoluteFill}
                    borderRadius={16}
                  />
                  <View
                    style={[
                      styles.appIconBox,
                      { backgroundColor: isBlocked ? "rgba(196,162,247,0.12)" : "rgba(45,26,74,0.8)" },
                    ]}
                  >
                    <Ionicons
                      name={app.icon}
                      size={22}
                      color={isBlocked ? "#C4A2F7" : "#9b80c8"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.appName,
                      { color: isBlocked ? "#f0eaff" : "#9b80c8" },
                    ]}
                  >
                    {app.label}
                  </Text>
                  <View
                    style={[
                      styles.toggle,
                      isBlocked && styles.toggleActive,
                    ]}
                  >
                    <Ionicons
                      name={isBlocked ? "shield-checkmark" : "shield-outline"}
                      size={16}
                      color={isBlocked ? "#1a0a2e" : "#9b80c8"}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 20,
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
    marginTop: 4,
    lineHeight: 20,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.15)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
  },
  infoSub: {
    fontSize: 13,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#9b80c8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  appList: {
    gap: 10,
  },
  appRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },
  appRowActive: {},
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(155,128,200,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#C4A2F7",
  },
});
