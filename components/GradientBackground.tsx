import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "deep" | "mid" | "card" | "gold";
}

export function GradientBackground({ children, style, variant = "deep" }: Props) {
  const gradients = {
    deep: ["#0d0620", "#1a0a2e", "#2a1050"] as [string, string, string],
    mid: ["#1a0a2e", "#2d1a4a", "#3d2460"] as [string, string, string],
    card: ["#2d1a4a", "#3d2460", "#4a2d70"] as [string, string, string],
    gold: ["#1a0a2e", "#2a1050", "#3d2460"] as [string, string, string],
  };

  return (
    <LinearGradient
      colors={gradients[variant]}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
