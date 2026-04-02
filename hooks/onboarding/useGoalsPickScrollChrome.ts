import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnimatedStyle, ScrollHandlerProcessed, SharedValue } from "react-native-reanimated";
import {
  Easing,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { ViewStyle } from "react-native";
import {
  GOALS_LIST_ROW_GAP,
  GOALS_LIST_VISIBLE_ROWS,
  GOALS_ROW_FALLBACK_HEIGHT,
  GOALS_STEP_SCROLL_PEEK_PX,
} from "@/constants/onboarding/goalsList";

export type GoalsPickScrollChrome = {
  onFirstGoalsRowLayout: (e: { nativeEvent: { layout: { height: number } } }) => void;
  goalsListViewportMaxHeight: number;
  goalsPickListViewportMaxHeight: number;
  goalsScrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
  goalsScrollViewportH: SharedValue<number>;
  goalsScrollContentH: SharedValue<number>;
  bumpGoalsScrollHint: () => void;
  goalsScrollRailStyle: AnimatedStyle<ViewStyle>;
  goalsScrollThumbStyle: AnimatedStyle<ViewStyle>;
};

/** Goals / relationship steps: list viewport height, custom scroll rail, and hint opacity animation. */
export function useGoalsPickScrollChrome(step: number): GoalsPickScrollChrome {
  const [goalsOptionRowHeight, setGoalsOptionRowHeight] = useState(0);

  const onFirstGoalsRowLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h <= 0) return;
    setGoalsOptionRowHeight((prev) => (Math.abs(h - prev) < 0.5 ? prev : h));
  }, []);

  const goalsListViewportMaxHeight = useMemo(() => {
    const rowH = goalsOptionRowHeight > 0 ? goalsOptionRowHeight : GOALS_ROW_FALLBACK_HEIGHT;
    return GOALS_LIST_VISIBLE_ROWS * rowH + (GOALS_LIST_VISIBLE_ROWS - 1) * GOALS_LIST_ROW_GAP;
  }, [goalsOptionRowHeight]);

  const goalsPickListViewportMaxHeight = useMemo(
    () => goalsListViewportMaxHeight + GOALS_STEP_SCROLL_PEEK_PX,
    [goalsListViewportMaxHeight]
  );

  const goalsScrollY = useSharedValue(0);
  const goalsScrollContentH = useSharedValue(0);
  const goalsScrollViewportH = useSharedValue(0);
  const goalsScrollHintOpacity = useSharedValue(0);
  const goalsScrollHintIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpGoalsScrollHint = useCallback(() => {
    goalsScrollHintOpacity.value = withTiming(0.46, { duration: 140, easing: Easing.out(Easing.cubic) });
    if (goalsScrollHintIdleRef.current) clearTimeout(goalsScrollHintIdleRef.current);
    goalsScrollHintIdleRef.current = setTimeout(() => {
      goalsScrollHintOpacity.value = withTiming(0.1, { duration: 780, easing: Easing.out(Easing.cubic) });
    }, 2100);
  }, [goalsScrollHintOpacity]);

  useEffect(() => {
    if (step !== 6 && step !== 7 && step !== 9) {
      goalsScrollHintOpacity.value = withTiming(0, { duration: 160 });
      goalsScrollY.value = 0;
      if (goalsScrollHintIdleRef.current) {
        clearTimeout(goalsScrollHintIdleRef.current);
        goalsScrollHintIdleRef.current = null;
      }
      return;
    }
    goalsScrollY.value = 0;
    goalsScrollHintOpacity.value = 0;
    const tEnter = setTimeout(() => {
      goalsScrollHintOpacity.value = withTiming(0.34, { duration: 440, easing: Easing.out(Easing.cubic) });
    }, 240);
    const tIdle = setTimeout(() => {
      goalsScrollHintOpacity.value = withTiming(0.1, { duration: 820, easing: Easing.out(Easing.cubic) });
    }, 3100);
    return () => {
      clearTimeout(tEnter);
      clearTimeout(tIdle);
      if (goalsScrollHintIdleRef.current) {
        clearTimeout(goalsScrollHintIdleRef.current);
        goalsScrollHintIdleRef.current = null;
      }
    };
  }, [step]);

  const goalsScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      goalsScrollY.value = e.contentOffset.y;
    },
  });

  const goalsScrollRailStyle = useAnimatedStyle(() => {
    const vh = goalsScrollViewportH.value;
    const ch = goalsScrollContentH.value;
    const scrollable = ch > vh + 2 && vh > 8;
    return {
      opacity: scrollable ? goalsScrollHintOpacity.value : 0,
    };
  });

  const goalsScrollThumbStyle = useAnimatedStyle(() => {
    const vh = goalsScrollViewportH.value;
    const ch = goalsScrollContentH.value;
    const sy = goalsScrollY.value;
    const inset = 20;
    const trackH = Math.max(0, vh - inset);
    if (ch <= vh + 2 || trackH < 28) {
      return { height: 0, transform: [{ translateY: 0 }] };
    }
    const thumbH = Math.min(trackH, Math.max(22, (vh / ch) * trackH));
    const maxScroll = ch - vh;
    const maxTravel = Math.max(0, trackH - thumbH);
    const p = maxScroll > 0 ? Math.min(1, Math.max(0, sy / maxScroll)) : 0;
    return {
      height: thumbH,
      transform: [{ translateY: p * maxTravel }],
    };
  });

  return {
    onFirstGoalsRowLayout,
    goalsListViewportMaxHeight,
    goalsPickListViewportMaxHeight,
    goalsScrollHandler,
    goalsScrollViewportH,
    goalsScrollContentH,
    bumpGoalsScrollHint,
    goalsScrollRailStyle,
    goalsScrollThumbStyle,
  };
}
