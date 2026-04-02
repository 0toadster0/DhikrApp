import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  /** When true, only the track + thumb are shown (parent supplies the main value display). */
  omitValueDisplay?: boolean;
  trackEndLabels?: { left: string; right: string };
  /** Called when the user starts/ends dragging — use to disable a parent ScrollView. */
  onDragActiveChange?: (active: boolean) => void;
  /** Snap thumb to discrete steps (integers between min and max) while dragging. */
  snapToSteps?: boolean;
  /** Light selection haptic when the stepped value changes (native only). */
  hapticOnStep?: boolean;
  /** Subtle scale pulse on the thumb when the value steps. */
  knobPulseOnStep?: boolean;
}

const TRACK_WIDTH = 280;
const THUMB_SIZE = 32;

function clampNum(v: number, lo: number, hi: number) {
  if (!Number.isFinite(v)) return lo;
  return Math.min(Math.max(v, lo), hi);
}

export function SliderInput({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  omitValueDisplay = false,
  trackEndLabels,
  onDragActiveChange,
  snapToSteps = false,
  hapticOnStep = false,
  knobPulseOnStep = false,
}: Props) {
  const colors = useColors();
  const { lo, hi, span } = useMemo(() => {
    const a = Number.isFinite(min) ? min : 1;
    const b = Number.isFinite(max) ? max : 10;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const range = hi - lo;
    return { lo, hi, span: range > 0 ? range : 1 };
  }, [min, max]);

  const trackSpan = Math.max(0, TRACK_WIDTH - THUMB_SIZE);
  const lastEmitted = useRef(clampNum(value, lo, hi));

  const loSV = useSharedValue(lo);
  const hiSV = useSharedValue(hi);
  const rangeSV = useSharedValue(span);
  const trackSpanSV = useSharedValue(trackSpan);
  const lastEmittedSV = useSharedValue(clampNum(value, lo, hi));

  useEffect(() => {
    loSV.value = lo;
    hiSV.value = hi;
    rangeSV.value = span;
    trackSpanSV.value = trackSpan;
  }, [lo, hi, span, trackSpan]);

  useEffect(() => {
    const v = clampNum(value, lo, hi);
    lastEmitted.current = v;
    lastEmittedSV.value = v;
  }, [value, lo, hi]);

  const fraction = span > 0 ? (clampNum(value, lo, hi) - lo) / span : 0;
  const thumbX = useSharedValue(fraction * trackSpan);
  const startX = useSharedValue(0);
  const knobPulseScale = useSharedValue(1);

  useEffect(() => {
    if (trackSpan <= 0) return;
    const v = clampNum(value, lo, hi);
    const f = span > 0 ? (v - lo) / span : 0;
    const safeF = Number.isFinite(f) ? clampNum(f, 0, 1) : 0;
    thumbX.value = safeF * trackSpan;
  }, [value, lo, hi, span, trackSpan]);

  const setDragActive = useCallback(
    (active: boolean) => {
      onDragActiveChange?.(active);
    },
    [onDragActiveChange]
  );

  const pulseKnob = useCallback(() => {
    runOnUI(() => {
      "worklet";
      knobPulseScale.value = withSequence(
        withTiming(1.055, { duration: 95 }),
        withTiming(1, { duration: 125 })
      );
    })();
  }, []);

  /** runOnJS path only when stepped value changes (worklet compares first). */
  const emitStepped = useCallback(
    (v: number) => {
      lastEmitted.current = v;
      onChange(v);
      if (hapticOnStep) {
        void Haptics.selectionAsync();
      }
      if (knobPulseOnStep) {
        pulseKnob();
      }
    },
    [hapticOnStep, knobPulseOnStep, onChange, pulseKnob]
  );

  const gesture = Gesture.Pan()
    // Prefer horizontal drags so a parent vertical ScrollView does not steal the slider.
    .activeOffsetX([-12, 12])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      startX.value = thumbX.value;
      runOnJS(setDragActive)(true);
    })
    .onUpdate((e) => {
      const ts = trackSpanSV.value;
      if (ts <= 0) return;
      let tx = startX.value + e.translationX;
      if (tx < 0) tx = 0;
      else if (tx > ts) tx = ts;
      const frac = ts > 0 ? tx / ts : 0;
      const raw = loSV.value + frac * rangeSV.value;
      const rounded = Math.round(raw);
      const loW = loSV.value;
      const hiW = hiSV.value;
      const stepped = rounded < loW ? loW : rounded > hiW ? hiW : rounded;
      if (snapToSteps && rangeSV.value > 0) {
        const snappedX = ((stepped - loW) / rangeSV.value) * ts;
        thumbX.value = snappedX;
      } else {
        thumbX.value = tx;
      }
      if (stepped !== lastEmittedSV.value) {
        lastEmittedSV.value = stepped;
        runOnJS(emitStepped)(stepped);
      }
    })
    .onEnd(() => {
      thumbX.value = withSpring(thumbX.value, { damping: 20 });
    })
    .onFinalize(() => {
      runOnJS(setDragActive)(false);
    });

  const thumbStyle = useAnimatedStyle(() => {
    const span = TRACK_WIDTH - THUMB_SIZE;
    let x = thumbX.value;
    if (typeof x !== "number" || !Number.isFinite(x)) x = 0;
    const tx = x <= 0 ? 0 : x >= span ? span : x;
    const s = knobPulseScale.value;
    return {
      transform: [{ translateX: tx }, { scale: s }],
      shadowOpacity: 0.8 + Math.min(0.2, (s - 1) * 4),
      shadowRadius: 8 + (s - 1) * 140,
    };
  });

  const fillWidth = useAnimatedStyle(() => {
    let x = thumbX.value;
    if (typeof x !== "number" || !Number.isFinite(x)) x = 0;
    let w = x + THUMB_SIZE / 2;
    if (!Number.isFinite(w)) w = 0;
    const width = w <= 0 ? 0 : w >= TRACK_WIDTH ? TRACK_WIDTH : w;
    return { width };
  });

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
      {!omitValueDisplay && (
        <View style={styles.valueRow}>
          <Text style={[styles.minLabel, { color: colors.mutedForeground }]}>{lo}</Text>
          <Text style={[styles.currentValue, { color: colors.foreground }]}>{clampNum(value, lo, hi)}</Text>
          <Text style={[styles.maxLabel, { color: colors.mutedForeground }]}>{hi}</Text>
        </View>
      )}
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
      {trackEndLabels && (
        <View style={styles.trackEndRow}>
          <Text style={[styles.trackEndLabel, { color: colors.mutedForeground }]}>{trackEndLabels.left}</Text>
          <Text style={[styles.trackEndLabel, { color: colors.mutedForeground }]}>{trackEndLabels.right}</Text>
        </View>
      )}
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
  trackEndRow: {
    flexDirection: "row",
    width: TRACK_WIDTH,
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  trackEndLabel: {
    fontSize: 13,
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
