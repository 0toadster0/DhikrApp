import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, G, LinearGradient, Stop } from "react-native-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { CenteredStep } from "../CenteredStep";
import { OnboardingMascot } from "../OnboardingMascot";
import { styles as onboardingStyles } from "../onboardingStyles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Base layout width for hero mascot (matches OnboardingMascot large art stage). */
const HERO_LAYOUT_BASE = 250;

// —— Loading sequence: bounded random walk to 100% (~5–7s), new shape each mount ——
/** One segment: animate from previous percent → `percent`, then optional pause before the next. */
type LoadStage = {
  percent: number;
  durationMs: number;
  /** Idle hold after this milestone, before the next segment starts. */
  pauseAfterMs?: number;
  easing?: EasingFunction | EasingFunctionFactory;
};

const DEFAULT_STAGE_EASING = Easing.out(Easing.cubic);

/** Easing variants per segment so motion isn’t one repeated curve. */
const EASING_PICKS: (EasingFunction | EasingFunctionFactory)[] = [
  Easing.out(Easing.cubic),
  Easing.out(Easing.quad),
  Easing.inOut(Easing.cubic),
  Easing.inOut(Easing.quad),
  Easing.bezier(0.33, 0, 0.2, 1),
  Easing.bezier(0.22, 0.06, 0.17, 1),
  Easing.bezier(0.4, 0, 0.2, 1),
];

function randRange(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function randInt(a: number, b: number): number {
  return Math.floor(a + Math.random() * (b - a + 1));
}

/** `count` unique indices in [0, maxExclusive). */
function pickDistinctIndices(count: number, maxExclusive: number): number[] {
  const pool = Array.from({ length: maxExclusive }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Random positive lengths that sum to `total`, each at least `minEach` (stable random jump sizes).
 */
function randomSegmentPercents(count: number, total: number, minEach: number): number[] {
  const slack = total - count * minEach;
  const cuts: number[] = [0];
  for (let i = 0; i < count - 1; i++) cuts.push(Math.random());
  cuts.push(1);
  cuts.sort((x, y) => x - y);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(minEach + (cuts[i + 1] - cuts[i]) * slack);
  }
  return out;
}

/**
 * Builds a fresh loading timeline: variable milestones, pauses, segment durations, easing.
 * Exactly three segments use a slow % crawl; the rest are quicker or steady. ~5–7s total.
 */
function generateRandomLoadStages(): LoadStage[] {
  const targetTotalMs = randRange(5200, 6800);
  const n = randInt(9, 12);
  const minEachPct = 3.2;
  const lengths = randomSegmentPercents(n, 100, minEachPct);
  const slowSegmentIndices = new Set(pickDistinctIndices(3, n));

  let acc = 0;
  const percents: number[] = [];
  for (let i = 0; i < n; i++) {
    acc += lengths[i];
    const p = i === n - 1 ? 100 : Math.min(99, Math.round(acc));
    percents.push(p);
  }
  percents[n - 1] = 100;
  for (let i = 1; i < percents.length; i++) {
    if (percents[i] <= percents[i - 1]) {
      percents[i] = Math.min(100, percents[i - 1] + 1);
    }
  }
  percents[percents.length - 1] = 100;

  const durationWeights: number[] = [];
  const pauseWeights: number[] = [];
  for (let i = 0; i < n; i++) {
    const deltaPct = lengths[i];
    let durFactor: number;
    if (slowSegmentIndices.has(i)) {
      durFactor = randRange(1.48, 2.15);
    } else {
      const paceRoll = Math.random();
      if (paceRoll < 0.48) {
        durFactor = randRange(0.52, 0.88);
      } else {
        durFactor = randRange(0.86, 1.22);
      }
    }
    durationWeights.push(deltaPct * durFactor * randRange(0.85, 1.15));

    if (i < n - 1) {
      let pauseW: number;
      const pauseRoll = Math.random();
      if (pauseRoll < 0.18) {
        pauseW = randRange(1.5, 2.4);
      } else if (pauseRoll < 0.38) {
        pauseW = randRange(0.25, 0.55);
      } else {
        pauseW = randRange(0.55, 1.35);
      }
      pauseWeights.push(pauseW * randRange(0.8, 1.2));
    }
  }

  const sumDur = durationWeights.reduce((s, w) => s + w, 0);
  const sumPause = pauseWeights.reduce((s, w) => s + w, 0);
  const combined = sumDur + sumPause;
  const scale = combined > 0 ? targetTotalMs / combined : 1;

  const stages: LoadStage[] = [];
  for (let i = 0; i < n; i++) {
    const durationMs = Math.max(180, Math.round(durationWeights[i] * scale));
    const easingPick = EASING_PICKS[randInt(0, EASING_PICKS.length - 1)];
    const stage: LoadStage = {
      percent: percents[i],
      durationMs,
      easing: easingPick,
    };
    if (i < n - 1) {
      const p = Math.max(40, Math.round(pauseWeights[i] * scale));
      const pauseCap = Math.round(randRange(300, 380));
      stage.pauseAfterMs = Math.min(pauseCap, p);
    }
    stages.push(stage);
  }

  // Close gap vs target after rounding / pause caps (split so the last mile isn’t always the only adjustment)
  let actual = 0;
  for (const s of stages) {
    actual += s.durationMs;
    if (s.pauseAfterMs) actual += s.pauseAfterMs;
  }
  const drift = targetTotalMs - actual;
  if (stages.length > 0 && Math.abs(drift) > 25) {
    const last = stages[stages.length - 1];
    const penultimate = stages.length > 1 ? stages[stages.length - 2] : null;
    const toLast = Math.round(drift * randRange(0.55, 0.88));
    const toPrev = drift - toLast;
    last.durationMs = Math.max(220, last.durationMs + toLast);
    if (penultimate && Math.abs(toPrev) > 8) {
      penultimate.durationMs = Math.max(180, penultimate.durationMs + toPrev);
    }
  }

  return stages;
}

function buildCheckinLoadAnimation(stages: LoadStage[]) {
  const parts: ReturnType<typeof withTiming>[] = [];
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const target = s.percent / 100;
    const timing = withTiming(target, {
      duration: s.durationMs,
      easing: s.easing ?? DEFAULT_STAGE_EASING,
    });
    if (i === 0) {
      parts.push(timing);
    } else {
      const pauseMs = stages[i - 1].pauseAfterMs ?? 0;
      parts.push(withDelay(pauseMs, timing));
    }
  }
  return withSequence(...parts);
}

// —— Copy (tweak here) ——
const REASSURANCE_HEADLINE = "We've got you covered.";

/** Subtitle under the ring: advances every 2s in this order, then loops. */
const LOADING_STATUS_MESSAGES = [
  "Customizing your dashboard…",
  "Personalizing your journey…",
  "Setting things up based on your responses…",
  "Building your experience…",
] as const;

const LOADING_STATUS_ROTATE_MS = 2000;

/** Space between mascot bounds and progress ring. */
const RING_OUTSET = 22;

/** Ring stroke — soft, readable on gradient backgrounds. */
const RING_STROKE = 5;

export type OnboardingCheckinPreviewStepProps = {
  onContinue: () => void;
};

export function OnboardingCheckinPreviewStep({ onContinue }: OnboardingCheckinPreviewStepProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [percentShown, setPercentShown] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const bottomSafe = Platform.OS === "web" ? 34 : insets.bottom;

  const heroTarget = Math.min(width * 0.88, height * 0.52);
  const heroScale = heroTarget / HERO_LAYOUT_BASE;

  const ringSize = heroTarget + RING_OUTSET * 2;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const radius = (ringSize - RING_STROKE) / 2 - 1;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  const statusLine = LOADING_STATUS_MESSAGES[statusIndex];
  const showCta = percentShown >= 100;

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % LOADING_STATUS_MESSAGES.length);
    }, LOADING_STATUS_ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const stages = generateRandomLoadStages();
    progress.value = 0;
    progress.value = buildCheckinLoadAnimation(stages) as unknown as number;
  }, [progress]);

  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setPercentShown)(current);
      }
    },
    [progress]
  );

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const minColumnHeight = Math.max(height * 0.62, 420);

  return (
    <CenteredStep>
      <View style={[localStyles.column, { minHeight: minColumnHeight }]}>
        <Text style={localStyles.headline} accessibilityRole="header">
          {REASSURANCE_HEADLINE}
        </Text>

        <View style={localStyles.heroBlock}>
          <View style={[localStyles.ringStage, { width: ringSize, height: ringSize }]}>
            <Svg
              width={ringSize}
              height={ringSize}
              style={StyleSheet.absoluteFill}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Defs>
                <LinearGradient id="checkinRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#D7C0FF" stopOpacity={0.95} />
                  <Stop offset="55%" stopColor="#C4A2F7" stopOpacity={1} />
                  <Stop offset="100%" stopColor="#F5C842" stopOpacity={0.88} />
                </LinearGradient>
              </Defs>
              <G rotation="-90" origin={`${cx}, ${cy}`}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  stroke="url(#checkinRingGrad)"
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  animatedProps={progressProps}
                />
              </G>
            </Svg>

            <View
              style={[
                localStyles.mascotWrap,
                {
                  width: HERO_LAYOUT_BASE,
                  height: HERO_LAYOUT_BASE,
                  transform: [{ scale: heroScale }],
                },
              ]}
            >
              <OnboardingMascot variant="hero" size="large" float />
            </View>
          </View>
        </View>

        <View style={localStyles.lowerBlock}>
          <Text
            style={localStyles.statusLine}
            accessibilityLiveRegion="polite"
            accessibilityLabel={statusLine}
          >
            {statusLine}
          </Text>

          <Text
            style={localStyles.percentText}
            accessibilityRole="text"
            accessibilityLabel={`Loading ${percentShown} percent`}
          >
            {percentShown}%
          </Text>

          {showCta ? (
            <Animated.View
              entering={FadeInDown.duration(480).delay(72).damping(20).stiffness(210)}
              style={[localStyles.ctaWrap, { paddingBottom: Math.max(bottomSafe, 12) }]}
            >
              <PrimaryButton
                label="Let's get started!"
                onPress={onContinue}
                style={onboardingStyles.nextBtn}
              />
            </Animated.View>
          ) : (
            <View style={{ height: 56 + Math.max(bottomSafe, 12) }} />
          )}
        </View>
      </View>
    </CenteredStep>
  );
}

const localStyles = StyleSheet.create({
  column: {
    width: "100%",
    alignSelf: "stretch",
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  headline: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "rgba(248, 244, 255, 0.92)",
    textAlign: "center",
    letterSpacing: -0.2,
    lineHeight: 24,
    paddingHorizontal: 24,
    maxWidth: 340,
    alignSelf: "center",
    marginBottom: 8,
  },
  heroBlock: {
    flex: 1,
    width: "100%",
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ringStage: {
    alignItems: "center",
    justifyContent: "center",
  },
  mascotWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  lowerBlock: {
    width: "100%",
    alignItems: "center",
    paddingTop: 4,
  },
  statusLine: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(244, 238, 255, 0.55)",
    textAlign: "center",
    letterSpacing: 0.15,
    lineHeight: 22,
    paddingHorizontal: 28,
    maxWidth: 320,
    marginBottom: 10,
  },
  percentText: {
    fontSize: 36,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(240, 234, 255, 0.94)",
    letterSpacing: 0.4,
    fontVariant: ["tabular-nums"],
    marginBottom: 6,
  },
  ctaWrap: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 10,
  },
});
