import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface Props {
  total: number;
  current: number;
  variant?: "default" | "thin";
}

const SEGMENT_COUNT = 5;

function getSegmentIndex(step: number) {
  // Onboarding pages (conceptual):
  // 1–2 Awareness, 3 Understanding, 4–8 Reflection, 9–11 Action, 12–16 Setup.
  if (step <= 1) return 0;
  if (step === 2) return 1;
  if (step >= 3 && step <= 7) return 2;
  if (step >= 8 && step <= 10) return 3;
  return 4;
}

export function ProgressDots({ current, variant = "default" }: Props) {
  const colors = useColors();
  const { width: screenW } = Dimensions.get("window");

  // Keep the whole component fixed-width so it can't shift layout between pages.
  const trackWidth = Math.min(Math.round(screenW * 0.72), 320);
  const height = variant === "thin" ? 3 : 10;
  const gap = variant === "thin" ? 3 : 4;
  const segmentWidth = (trackWidth - gap * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT;
  const highlightWidth = segmentWidth * (variant === "thin" ? 1.05 : 1.12); // slightly wider active segment
  const highlightRadius = height / 2;

  const leftForSegment = (idx: number) => {
    const baseX = idx * (segmentWidth + gap);
    const desiredLeft = baseX + (segmentWidth - highlightWidth) / 2;
    const minLeft = 0;
    const maxLeft = trackWidth - highlightWidth;
    return Math.max(minLeft, Math.min(maxLeft, desiredLeft));
  };

  const activeSegment = getSegmentIndex(current);
  const highlightLeft = useSharedValue(leftForSegment(activeSegment));
  const highlightScale = useSharedValue(1);
  const highlightOpacity = useSharedValue(variant === "thin" ? 0.9 : 1);

  useEffect(() => {
    const nextLeft = leftForSegment(activeSegment);
    highlightLeft.value = withTiming(nextLeft, {
      duration: 320,
      easing: Easing.inOut(Easing.sin),
    });
    // Tiny "breathing" width feel (via scale) when moving segments.
    highlightScale.value = variant === "thin" ? 0.99 : 0.98;
    highlightScale.value = withTiming(1, {
      duration: 260,
      easing: Easing.inOut(Easing.sin),
    });
    // Subtle calm fade to suggest motion without harsh animation.
    highlightOpacity.value = variant === "thin" ? 0.76 : 0.78;
    highlightOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.inOut(Easing.sin),
    });
  }, [activeSegment, highlightLeft, highlightScale, highlightOpacity]);

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightOpacity.value,
    left: highlightLeft.value,
    transform: [{ scaleX: highlightScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          {
            width: trackWidth,
            height,
            borderRadius: highlightRadius,
            backgroundColor: variant === "thin" ? "rgba(196,162,247,0.06)" : "rgba(196,162,247,0.08)",
          },
        ]}
      >
        {/* Inactive segments */}
        <View style={[styles.segmentsRow, { gap }]}>
          {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  width: segmentWidth,
                  height,
                  borderRadius: highlightRadius,
                  opacity: variant === "thin" ? 0.22 : 0.26,
                  backgroundColor: variant === "thin" ? "rgba(196,162,247,0.18)" : "rgba(196,162,247,0.22)",
                },
              ]}
            />
          ))}
        </View>

        {/* Active highlight */}
        <Animated.View
          style={[
            styles.highlight,
            variant === "thin" && styles.highlightThin,
            {
              width: highlightWidth,
              height,
              borderRadius: highlightRadius,
              backgroundColor: variant === "thin" ? "rgba(240,234,255,0.86)" : "rgba(255,255,255,0.88)",
            },
            highlightStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(196,162,247,0.08)",
  },
  segmentsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  segment: {
    backgroundColor: "rgba(196,162,247,0.22)",
  },
  highlight: {
    position: "absolute",
    top: 0,
    // Soft, calm glow.
    shadowColor: "#C4A2F7",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 0,
  },
  highlightThin: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});
