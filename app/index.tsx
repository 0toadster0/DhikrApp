import { Redirect, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { NativeModules, View, ActivityIndicator } from "react-native";

export default function IndexScreen() {
  const { state, isLoading } = useApp();
  const router = useRouter();

  console.log(Object.keys(NativeModules));
  console.log("ScreenTimeModule =", NativeModules.ScreenTimeModule);

  useEffect(() => {
    const consumeOpenDhikrRequest = async () => {
      try {
        const result = await NativeModules.ScreenTimeModule?.consumeOpenDhikrRequested?.();
        const requested = typeof result === "boolean" ? result : result?.requested;

        if (requested === true) {
          console.log("Open dhikr requested from shield");
          router.replace("/ritual");
        } else if (requested === false) {
          console.log("No pending dhikr request");
        } else {
          console.log("No pending dhikr request");
        }
      } catch (error) {
        console.log("No pending dhikr request");
      }
    };

    void consumeOpenDhikrRequest();
  }, [router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0d0620" }}>
        <ActivityIndicator color="#C4A2F7" />
      </View>
    );
  }

  if (!state.profile.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
