import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/components/GradientBackground";
import { useApp } from "@/context/AppContext";
import { capture, PLAN_TYPES, screen } from "@/lib/analytics";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { state, resetOnboarding } = useApp();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const handleEnableNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();

      if (newStatus !== "granted") {
        Linking.openSettings();
      }
    } else {
      Linking.openSettings();
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Restart Onboarding",
      "This will reset your onboarding preferences. Your session history will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    screen("settings");
  }, []);

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
          <Text style={styles.title}>Settings</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.group}>
            <SettingRow
              icon="notifications-outline"
              label="Enable notifications"
              onPress={handleEnableNotifications}
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={styles.sectionLabel}>Subscription</Text>
          <View style={styles.group}>
            <View style={styles.subscriptionCard}>
              <LinearGradient
                colors={["rgba(245,200,66,0.08)", "rgba(45,26,74,0.7)"]}
                style={StyleSheet.absoluteFill}
                borderRadius={16}
              />
              <Ionicons name="star" size={24} color="#F5C842" />
              <View style={styles.subInfo}>
                <Text style={styles.subTitle}>
                  {state.isPremium ? "Premium Active" : "Free Plan"}
                </Text>
                <Text style={styles.subSub}>
                  {state.isPremium ? "Full access to all features" : "Upgrade to unlock everything"}
                </Text>
              </View>
              {!state.isPremium && (
                <Pressable
                  style={styles.upgradeBtn}
                  onPress={() => {
                    capture("paywall_viewed", {
                      source_screen: "settings",
                      trigger: "upgrade_button",
                    });
                    capture("paywall_cta_clicked", { plan_type: PLAN_TYPES[0] });
                    capture("subscription_started", { plan_type: PLAN_TYPES[0] });
                  }}
                >
                  <Text style={styles.upgradeLabel}>Upgrade</Text>
                </Pressable>
              )}
            </View>
            <SettingRow
              icon="refresh-outline"
              label="Restore purchases"
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.group}>
            <SettingRow
              icon="refresh-circle-outline"
              label="Restart onboarding"
              onPress={handleReset}
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
            <SettingRow
              icon="document-text-outline"
              label="Privacy Policy"
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
            <SettingRow
              icon="information-circle-outline"
              label="About Dhikr"
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.group}>
            <SettingRow
              icon="star-outline"
              label="Like the app"
              subtitle="Leave a review"
              onPress={() => {
                console.log("TODO: open app store review");
              }}
              right={<Ionicons name="chevron-forward" size={16} color="#9b80c8" />}
            />
          </View>
        </Animated.View>

        <Text style={styles.version}>Dhikr · Version 1.0.0</Text>
      </ScrollView>
    </GradientBackground>
  );
}

function SettingRow({
  icon,
  label,
  subtitle,
  right,
  onPress,
  rightText,
}: {
  icon: any;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  rightText?: string;
}) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingIconBox}>
        <Ionicons name={icon} size={18} color="#C4A2F7" />
      </View>
      <View style={styles.settingLabelCol}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.settingRight}>{right}</View>
    </Pressable>
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
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9b80c8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  group: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.1)",
    backgroundColor: "rgba(45,26,74,0.5)",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,162,247,0.06)",
    gap: 14,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(196,162,247,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabelCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#f0eaff",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  settingRight: {
    alignItems: "flex-end",
  },
  rightText: {
    fontSize: 14,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
  },
  subscriptionCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,162,247,0.06)",
  },
  subInfo: {
    flex: 1,
  },
  subTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#f0eaff",
  },
  subSub: {
    fontSize: 12,
    color: "#9b80c8",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: "#F5C842",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#1a0a2e",
  },
  version: {
    fontSize: 12,
    color: "rgba(155,128,200,0.4)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
});
