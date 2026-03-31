import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface Props {
  total: number;
  current: number;
}

function Dot({ active }: { active: boolean }) {
  const colors = useColors();
  const animStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 20 : 6, { duration: 250 }),
    backgroundColor: withTiming(active ? colors.primary : "rgba(196,162,247,0.3)", { duration: 250 }),
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} active={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
