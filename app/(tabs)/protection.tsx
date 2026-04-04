import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
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
import {
  ensureScreenTimeAuthorized,
  getFamilyActivitySelectionState,
  isScreenTimeModuleAvailable,
  presentFamilyActivityPicker,
  setFamilyActivitySelectionBase64,
} from "@/utils/screenTime";

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
  /** iOS: counts from FamilyActivitySelection (native); checklist slugs are separate in-app prefs only. */
  const [iosShieldApplicationCount, setIosShieldApplicationCount] = useState(0);
  const [iosShieldCategoryCount, setIosShieldCategoryCount] = useState(0);
  const [iosShieldWebDomainCount, setIosShieldWebDomainCount] = useState(0);
  const [iosPickerLoading, setIosPickerLoading] = useState(false);
  /** After first `getFamilyActivitySelectionState` on this mount; avoids showing configured from stale profile before native is read. */
  const [iosNativeScreenTimeReady, setIosNativeScreenTimeReady] = useState(false);
  /** From last native read or picker result — configured UI must not rely on `profile.familyActivitySelectionBase64` alone. */
  const [iosNativeHasSavedSelection, setIosNativeHasSavedSelection] = useState(false);
  const [iosScreenTimeVerifyError, setIosScreenTimeVerifyError] = useState(false);
  const [iosPullRefreshing, setIosPullRefreshing] = useState(false);
  const profileSelectionB64Ref = useRef(state.profile.familyActivitySelectionBase64);
  profileSelectionB64Ref.current = state.profile.familyActivitySelectionBase64;
  /** When true, wait for profile to drop stale `familyActivitySelectionBase64` before `iosNativeScreenTimeReady` (avoids hydrate race). */
  const pendingStaleSelectionClearRef = useRef(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 104;

  const refreshIosShieldState = useCallback(async () => {
    if (!isScreenTimeModuleAvailable()) return;
    setIosScreenTimeVerifyError(false);
    try {
      const native = await getFamilyActivitySelectionState();
      const totalNative =
        native.applicationCount + native.categoryCount + native.webDomainCount;
      const hasNativeSelection = Boolean(native.selectionBase64);
      setIosShieldApplicationCount(native.applicationCount);
      setIosShieldCategoryCount(native.categoryCount);
      setIosShieldWebDomainCount(native.webDomainCount);
      setIosNativeHasSavedSelection(hasNativeSelection);

      const profileB64 = profileSelectionB64Ref.current?.trim();
      if (!hasNativeSelection && totalNative === 0 && profileB64) {
        pendingStaleSelectionClearRef.current = true;
        updateProfile({ familyActivitySelectionBase64: undefined });
      } else if (
        native.selectionBase64 &&
        native.selectionBase64 !== profileSelectionB64Ref.current
      ) {
        updateProfile({ familyActivitySelectionBase64: native.selectionBase64 });
      }
    } catch {
      setIosScreenTimeVerifyError(true);
    } finally {
      if (!pendingStaleSelectionClearRef.current) {
        setIosNativeScreenTimeReady(true);
      }
    }
  }, [updateProfile]);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = blocked.includes(id)
      ? blocked.filter((a) => a !== id)
      : [...blocked, id];
    setBlocked(updated);
    updateProfile({ appsToBlock: updated });
  };

  const openIosScreenTimePicker = async () => {
    if (!isScreenTimeModuleAvailable()) return;
    setIosPickerLoading(true);
    setIosScreenTimeVerifyError(false);
    try {
      const authorized = await ensureScreenTimeAuthorized();
      if (!authorized) {
        return;
      }
      const result = await presentFamilyActivityPicker();
      updateProfile({ familyActivitySelectionBase64: result.selectionBase64 });
      setIosShieldApplicationCount(result.applicationCount);
      setIosShieldCategoryCount(result.categoryCount);
      setIosShieldWebDomainCount(result.webDomainCount);
      setIosNativeHasSavedSelection(Boolean(result.selectionBase64?.trim()));
      setIosNativeScreenTimeReady(true);
    } catch {
      // USER_CANCELLED or native error — ignore for UX
    } finally {
      setIosPickerLoading(false);
    }
  };

  useEffect(() => {
    capture("app_blocking_setup_started");
    screen("protection_setup");
  }, []);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    void refreshIosShieldState();
  }, [refreshIosShieldState]);

  const onIosPullRefresh = useCallback(async () => {
    if (!isScreenTimeModuleAvailable()) return;
    setIosPullRefreshing(true);
    try {
      await refreshIosShieldState();
    } finally {
      setIosPullRefreshing(false);
    }
  }, [refreshIosShieldState]);

  const onRetryScreenTimeCheck = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void refreshIosShieldState();
  }, [refreshIosShieldState]);

  useEffect(() => {
    if (!pendingStaleSelectionClearRef.current) return;
    if (state.profile.familyActivitySelectionBase64?.trim()) return;
    pendingStaleSelectionClearRef.current = false;
    setIosNativeScreenTimeReady(true);
  }, [state.profile.familyActivitySelectionBase64]);

  // Hydrate native from profile only after the first native read, so stale profile cannot repopulate App Group before we reconcile.
  useEffect(() => {
    if (Platform.OS !== "ios" || !iosNativeScreenTimeReady) return;
    const b64 = state.profile.familyActivitySelectionBase64;
    if (!b64) return;
    void setFamilyActivitySelectionBase64(b64).catch(() => {});
  }, [state.profile.familyActivitySelectionBase64, iosNativeScreenTimeReady]);

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

  const showIosScreenTimeUi =
    Platform.OS === "ios" && isScreenTimeModuleAvailable();
  const totalIosShieldTargets =
    iosShieldApplicationCount +
    iosShieldCategoryCount +
    iosShieldWebDomainCount;
  /** Native/App Group only after first refresh — not `profile.familyActivitySelectionBase64` alone. */
  const iosScreenTimeConfigured =
    iosNativeScreenTimeReady &&
    (iosNativeHasSavedSelection || totalIosShieldTargets > 0);
  const iosScreenTimeStatusPending = showIosScreenTimeUi && !iosNativeScreenTimeReady;

  const protectedSummaryAppsOnly =
    iosShieldCategoryCount === 0 &&
    iosShieldWebDomainCount === 0 &&
    iosShieldApplicationCount > 0;
  const protectedSummaryLine =
    showIosScreenTimeUi &&
    iosNativeScreenTimeReady &&
    !iosScreenTimeVerifyError &&
    iosScreenTimeConfigured &&
    totalIosShieldTargets > 0
      ? protectedSummaryAppsOnly
        ? `Protecting ${iosShieldApplicationCount} app${iosShieldApplicationCount === 1 ? "" : "s"}`
        : `Protecting ${totalIosShieldTargets} selection${totalIosShieldTargets === 1 ? "" : "s"}`
      : null;
  const showProtectedHint =
    showIosScreenTimeUi &&
    iosNativeScreenTimeReady &&
    !iosScreenTimeVerifyError &&
    !iosScreenTimeConfigured;
  const showSavedOnDevice =
    showIosScreenTimeUi &&
    iosNativeScreenTimeReady &&
    !iosScreenTimeVerifyError &&
    iosScreenTimeConfigured;

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 20, paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          showIosScreenTimeUi ? (
            <RefreshControl
              refreshing={iosPullRefreshing}
              onRefresh={onIosPullRefresh}
              tintColor="#C4A2F7"
              colors={["#C4A2F7"]}
            />
          ) : undefined
        }
      >
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.titleBlock}
        >
          <Text style={styles.title}>Protected Apps</Text>
          <Text style={styles.sub}>
            {showIosScreenTimeUi
              ? "Choose the apps you want to place behind a mindful pause."
              : "A gentle pause with Dhikr before you open the apps you choose here."}
          </Text>
        </Animated.View>

        {showIosScreenTimeUi ? (
          <View style={styles.statusGroup}>
            <Animated.View
              entering={FadeInDown.duration(400).delay(160)}
              style={styles.statusStripShadow}
            >
              <View
                style={[
                  styles.statusStrip,
                  iosScreenTimeVerifyError && styles.statusStripError,
                  {
                    borderColor: iosScreenTimeVerifyError
                      ? "rgba(196, 162, 247, 0.28)"
                      : iosScreenTimeConfigured
                        ? "rgba(196,162,247,0.32)"
                        : "rgba(155,128,200,0.22)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusIconWrap,
                    iosScreenTimeConfigured &&
                      !iosScreenTimeVerifyError &&
                      !iosScreenTimeStatusPending &&
                      styles.statusIconWrapSuccess,
                  ]}
                >
                  {iosScreenTimeStatusPending ? (
                    <ActivityIndicator color="#C4A2F7" size="small" />
                  ) : (
                    <Ionicons
                      name={
                        iosScreenTimeVerifyError
                          ? "information-circle-outline"
                          : iosScreenTimeConfigured
                            ? "checkmark-circle"
                            : "sparkles-outline"
                      }
                      size={22}
                      color={
                        iosScreenTimeVerifyError
                          ? "#d4b8ec"
                          : iosScreenTimeConfigured
                            ? "#8fd9ae"
                            : "#c4b0e8"
                      }
                    />
                  )}
                </View>
                <View style={styles.statusStripText}>
                  <Text style={styles.statusStripTitle}>
                    {iosScreenTimeStatusPending
                      ? "Checking connection…"
                      : iosScreenTimeVerifyError
                        ? "Screen Time access not connected"
                        : iosScreenTimeConfigured
                          ? "Protection is on"
                          : "Ready when you are"}
                  </Text>
                  {iosScreenTimeStatusPending ? (
                    <Text style={styles.statusStripSubMuted}>
                      Linking with Screen Time on this device.
                    </Text>
                  ) : iosScreenTimeVerifyError ? (
                    <>
                      <Text style={styles.statusStripSub}>
                        To protect apps, make sure Screen Time permission is enabled
                        on this device.
                      </Text>
                      <Pressable
                        onPress={onRetryScreenTimeCheck}
                        hitSlop={12}
                        style={({ pressed }) => [
                          styles.checkAgainPressable,
                          pressed && styles.checkAgainPressablePressed,
                        ]}
                      >
                        <Text style={styles.checkAgainText}>Check again</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={styles.statusStripSub}>
                      {iosScreenTimeConfigured
                        ? "Your protected apps are saved — opening them can begin with Dhikr."
                        : "Tap below to pick apps in Apple's Screen Time picker."}
                    </Text>
                  )}
                </View>
              </View>
            </Animated.View>

            {iosNativeScreenTimeReady &&
            !iosScreenTimeVerifyError &&
            (protectedSummaryLine || showProtectedHint || showSavedOnDevice) ? (
              <Animated.View
                entering={FadeInDown.duration(400).delay(180)}
                style={styles.protectedSummaryBlock}
              >
                {protectedSummaryLine ? (
                  <Text style={styles.protectedSummaryText}>{protectedSummaryLine}</Text>
                ) : showProtectedHint ? (
                  <Text style={styles.protectedSummaryHint}>
                    Nothing selected yet — tap below to choose apps.
                  </Text>
                ) : null}
                {showSavedOnDevice ? (
                  <Text style={styles.savedOnDeviceText}>Saved on this device</Text>
                ) : null}
              </Animated.View>
            ) : null}
          </View>
        ) : null}

        {!showIosScreenTimeUi ? (
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.infoCard}>
            <LinearGradient
              colors={["rgba(196,162,247,0.08)", "rgba(45,26,74,0.7)"]}
              style={StyleSheet.absoluteFill}
              borderRadius={18}
            />
            <Ionicons name="shield-checkmark" size={28} color="#C4A2F7" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Ritual before access</Text>
              <Text style={styles.infoSub}>
                Toggle the apps you want to pause for Dhikr first — you can adjust this
                anytime.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {showIosScreenTimeUi ? (
          <Animated.View
            entering={FadeInDown.duration(400).delay(220)}
            style={styles.actionCardWrap}
          >
            <View style={styles.screenTimeRowShadow}>
              <Pressable
                onPress={openIosScreenTimePicker}
                disabled={iosPickerLoading}
                style={[
                  styles.screenTimeRow,
                  {
                    borderColor: "rgba(196,162,247,0.38)",
                    opacity: iosPickerLoading ? 0.65 : 1,
                  },
                ]}
              >
                <LinearGradient
                  colors={["rgba(210,175,255,0.22)", "rgba(62,38,108,0.72)"]}
                  style={StyleSheet.absoluteFill}
                  borderRadius={20}
                />
                <View style={styles.screenTimeRowIconBubble}>
                  {iosPickerLoading ? (
                    <ActivityIndicator color="#C4A2F7" />
                  ) : (
                    <Ionicons name="apps-outline" size={24} color="#e8d9ff" />
                  )}
                </View>
                <View style={styles.screenTimeRowText}>
                  <Text style={styles.screenTimeRowTitle}>Choose apps to protect</Text>
                  <Text style={styles.screenTimeRowSub}>
                    {iosScreenTimeConfigured
                      ? "Add or remove apps in the Screen Time picker"
                      : "Pick the apps you'd like to pause before opening"}
                  </Text>
                </View>
                <View style={styles.screenTimeChevron}>
                  <Ionicons name="chevron-forward" size={20} color="#d4c4f0" />
                </View>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
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
                      borderRadius={18}
                    />
                    <View
                      style={[
                        styles.appIconBox,
                        {
                          backgroundColor: isBlocked
                            ? "rgba(196,162,247,0.12)"
                            : "rgba(45,26,74,0.8)",
                        },
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
                    <View style={[styles.toggle, isBlocked && styles.toggleActive]}>
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
        )}

        <View style={styles.bottomSection}>
          {showIosScreenTimeUi ? (
            <Animated.View
              entering={FadeInDown.duration(400).delay(260)}
              style={styles.howItWorksCard}
            >
              <Text style={styles.howItWorksLabel}>How it works</Text>
              <Text style={styles.howItWorksBody}>
                When you open a protected app, Dhikr can invite you into a short mindful
                moment first — then you continue as usual.
              </Text>
            </Animated.View>
          ) : null}
          <Text style={styles.footerNote}>
            You can change your protected apps anytime.
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 28,
  },
  titleBlock: {
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#f0eaff",
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 14,
    color: "rgba(155,128,200,0.92)",
    fontFamily: "Inter_400Regular",
    marginTop: 10,
    lineHeight: 21,
    maxWidth: 340,
  },
  statusGroup: {
    marginTop: 2,
    marginBottom: 4,
  },
  statusStripShadow: {
    borderRadius: 20,
    shadowColor: "#9b6fd4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  statusStrip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(22,12,42,0.45)",
    overflow: "hidden",
  },
  statusStripError: {
    backgroundColor: "rgba(88, 52, 98, 0.2)",
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,162,247,0.12)",
    borderWidth: 1,
    borderColor: "rgba(196,162,247,0.14)",
  },
  statusIconWrapSuccess: {
    backgroundColor: "rgba(125, 206, 160, 0.1)",
    borderColor: "rgba(125, 206, 160, 0.18)",
  },
  protectedSummaryBlock: {
    marginTop: 10,
    paddingLeft: 56,
    gap: 4,
  },
  protectedSummaryText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.72)",
    lineHeight: 17,
  },
  protectedSummaryHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.52)",
    lineHeight: 17,
  },
  savedOnDeviceText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.38)",
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  actionCardWrap: {
    marginTop: 6,
  },
  screenTimeRowShadow: {
    borderRadius: 20,
    shadowColor: "#c9a8ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  statusStripText: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  statusStripTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#f4eeff",
    letterSpacing: -0.2,
  },
  statusStripSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(200, 180, 230, 0.88)",
    lineHeight: 19,
  },
  statusStripSubMuted: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.65)",
    lineHeight: 17,
    marginTop: 2,
  },
  checkAgainPressable: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 6,
    paddingRight: 8,
  },
  checkAgainPressablePressed: {
    opacity: 0.7,
  },
  checkAgainText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#d8c4f5",
    letterSpacing: 0.1,
  },
  infoCard: {
    borderRadius: 18,
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
    marginBottom: 6,
  },
  screenTimeRow: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    overflow: "hidden",
  },
  screenTimeRowIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,162,247,0.18)",
    borderWidth: 1,
    borderColor: "rgba(232,210,255,0.22)",
  },
  screenTimeRowText: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
  },
  screenTimeRowTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#faf6ff",
    letterSpacing: -0.25,
  },
  screenTimeRowSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(220, 200, 248, 0.82)",
    lineHeight: 19,
  },
  screenTimeChevron: {
    width: 28,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  bottomSection: {
    marginTop: "auto",
    paddingTop: 8,
    gap: 20,
    paddingBottom: 8,
  },
  howItWorksCard: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "rgba(26,12,48,0.38)",
    borderWidth: 1,
    borderColor: "rgba(155,128,200,0.14)",
  },
  howItWorksLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(196,180,230,0.95)",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  howItWorksBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.82)",
    lineHeight: 20,
  },
  footerNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(155,128,200,0.48)",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  appList: {
    gap: 10,
  },
  appRow: {
    borderRadius: 18,
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
