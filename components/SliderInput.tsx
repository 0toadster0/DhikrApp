import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const TRACK_WIDTH = 280;
const THUMB_SIZE = 32;

export function SliderInput({ value, onChange, min = 1, max = 10, label }: Props) {
  const colors = useColors();
  const fraction = (value - min) / (max - min);
  const thumbX = useSharedValue(fraction * (TRACK_WIDTH - THUMB_SIZE));
  const startX = useSharedValue(0);

  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

  const updateValue = useCallback((x: number) => {
    const clamped = clamp(x, 0, TRACK_WIDTH - THUMB_SIZE);
    const frac = clamped / (TRACK_WIDTH - THUMB_SIZE);
    const newVal = Math.round(min + frac * (max - min));
    onChange(newVal);
  }, [min, max, onChange]);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const newX = clamp(startX.value + e.translationX, 0, TRACK_WIDTH - THUMB_SIZE);
      thumbX.value = newX;
      runOnJS(updateValue)(newX);
    })
    .onEnd(() => {
      thumbX.value = withSpring(thumbX.value, { damping: 20 });
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillWidth = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
      <View style={styles.valueRow}>
        <Text style={[styles.minLabel, { color: colors.mutedForeground }]}>{min}</Text>
        <Text style={[styles.currentValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.maxLabel, { color: colors.mutedForeground }]}>{max}</Text>
      </View>
      <View style={[styles.track, { width: TRACK_WIDTH, backgroundColor: "rgba(196,162,247,0.15)" }]}>
        <Animated.View style={[styles.fill, fillWidth]}>
          <LinearGradient
            colors={["#6B3FA0", "#C4A2F7"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.thumb, thumbStyle, { backgroundColor: colors.primary }]} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  valueRow: {
    flexDirection: "row",
    width: TRACK_WIDTH,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  currentValue: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
  },
  minLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  maxLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: "relative",
    overflow: "visible",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    top: -(THUMB_SIZE / 2 - 3),
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
