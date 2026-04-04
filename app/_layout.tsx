import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import type { NotificationResponse } from "expo-notifications";
import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isDhikrReminderNotificationResponse } from "@/constants/dhikrReminderNotification";
import { APP_OPEN_SOURCES, capture, initAnalytics, trackAppOpened } from "@/lib/analytics";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="ritual" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const handledNotificationResponseIds = useRef(new Set<string>());

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    void (async () => {
      await initAnalytics();
      await trackAppOpened(APP_OPEN_SOURCES[0]);
    })();

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void trackAppOpened(APP_OPEN_SOURCES[1]);
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const handleNotificationResponse = (response: NotificationResponse) => {
      const id =
        response.notification.request.identifier ??
        `${String(response.notification.date)}:${response.notification.request.content.title ?? ""}`;

      if (handledNotificationResponseIds.current.has(id)) return;
      handledNotificationResponseIds.current.add(id);

      capture("reminder_opened");

      if (!isDhikrReminderNotificationResponse(response)) return;

      router.push("/ritual?entry_source=notification");
    };

    const notificationOpenSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response);
      }
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleNotificationResponse(response);
    });

    return () => {
      notificationOpenSub.remove();
    };
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
