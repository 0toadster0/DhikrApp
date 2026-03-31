import { Redirect } from "expo-router";
import React from "react";
import { useApp } from "@/context/AppContext";
import { View, ActivityIndicator } from "react-native";

export default function IndexScreen() {
  const { state, isLoading } = useApp();

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
