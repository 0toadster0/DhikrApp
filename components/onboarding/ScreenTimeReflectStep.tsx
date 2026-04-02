import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
  SCREEN_TIME_REFLECT_COUNT_DURATION_MS,
  SCREEN_TIME_REFLECT_COUNT_STAGGER_MS,
} from "@/constants/onboarding/screenTime";
import { easeOutCubic, formatIntegerWithCommas } from "@/lib/onboarding/screenTimeReflection";

import { styles } from "./onboardingStyles";

export type ScreenTimeReflectStepProps = {
  trimmedName: string;
  hasName: boolean;
  hoursPerYear: number;
  daysPerYear: number;
  lifetimeDisplay: string;
  lifetimeRounded: number;
  lifetimeIsWhole: boolean;
  quranDays: number;
  introEmphasis: string;
  foreground: string;
};

export function ScreenTimeReflectStep({
  trimmedName,
  hasName,
  hoursPerYear,
  daysPerYear,
  lifetimeDisplay,
  lifetimeRounded,
  lifetimeIsWhole,
  quranDays,
  introEmphasis,
  foreground,
}: ScreenTimeReflectStepProps) {
  const accentStyle = [styles.screenTimeReflectAccent, { color: introEmphasis }];
  const bodyStyle = [styles.screenTimeReflectBody, { color: foreground }];

  const finals = useMemo(
    () => ({
      h: formatIntegerWithCommas(hoursPerYear),
      d: formatIntegerWithCommas(daysPerYear),
      l: lifetimeDisplay,
      q: formatIntegerWithCommas(quranDays),
    }),
    [hoursPerYear, daysPerYear, lifetimeDisplay, quranDays]
  );

  const [shown, setShown] = useState(() => ({
    h: formatIntegerWithCommas(0),
    d: formatIntegerWithCommas(0),
    l: "0",
    q: formatIntegerWithCommas(0),
  }));

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    const t0 = performance.now();
    const endMs = 3 * SCREEN_TIME_REFLECT_COUNT_STAGGER_MS + SCREEN_TIME_REFLECT_COUNT_DURATION_MS;

    const segProgress = (elapsed: number, delay: number) => {
      const raw = (elapsed - delay) / SCREEN_TIME_REFLECT_COUNT_DURATION_MS;
      if (raw <= 0) return 0;
      if (raw >= 1) return 1;
      return easeOutCubic(raw);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - t0;

      if (elapsed >= endMs) {
        setShown(finals);
        return;
      }

      const s0 = 0;
      const s1 = SCREEN_TIME_REFLECT_COUNT_STAGGER_MS;
      const s2 = 2 * SCREEN_TIME_REFLECT_COUNT_STAGGER_MS;
      const s3 = 3 * SCREEN_TIME_REFLECT_COUNT_STAGGER_MS;

      const ph = segProgress(elapsed, s0);
      const pd = segProgress(elapsed, s1);
      const pl = segProgress(elapsed, s2);
      const pq = segProgress(elapsed, s3);

      const h = formatIntegerWithCommas(Math.round(hoursPerYear * ph));
      const d = formatIntegerWithCommas(Math.round(daysPerYear * pd));
      const lVal = lifetimeRounded * pl;
      const l = lifetimeIsWhole
        ? String(Math.round(lVal))
        : (() => {
            const x = Math.round(lVal * 10) / 10;
            return Number.isInteger(x) ? String(x) : x.toFixed(1);
          })();
      const q = formatIntegerWithCommas(Math.round(quranDays * pq));

      setShown({ h, d, l, q });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [finals, hoursPerYear, daysPerYear, lifetimeRounded, lifetimeIsWhole, quranDays]);

  return (
    <>
      <View style={styles.screenTimeReflectBlock}>
        <Text style={styles.screenTimeReflectParagraph}>
          {hasName ? (
            <>
              <Text style={bodyStyle}>
                {trimmedName}, you{"\u2019"}ll spend{" "}
              </Text>
              <Text style={accentStyle}>{shown.h}</Text>
              <Text style={bodyStyle}> hours on your phone this year</Text>
            </>
          ) : (
            <>
              <Text style={bodyStyle}>You{"\u2019"}ll spend </Text>
              <Text style={accentStyle}>{shown.h}</Text>
              <Text style={bodyStyle}> hours on your phone this year</Text>
            </>
          )}
        </Text>
      </View>
      <View style={styles.screenTimeReflectBlock}>
        <Text style={styles.screenTimeReflectParagraph}>
          <Text style={bodyStyle}>That{"\u2019"}s over </Text>
          <Text style={accentStyle}>{shown.d}</Text>
          <Text style={bodyStyle}> days this year alone</Text>
        </Text>
      </View>
      <View style={styles.screenTimeReflectBlock}>
        <Text style={styles.screenTimeReflectParagraph}>
          <Text style={bodyStyle}>Or </Text>
          <Text style={accentStyle}>{shown.l}</Text>
          <Text style={bodyStyle}> years over your lifetime...</Text>
        </Text>
      </View>
      <View style={styles.screenTimeReflectBlock}>
        <Text style={styles.screenTimeReflectParagraph}>
          <Text style={bodyStyle}>You could read the entire </Text>
          <Text style={accentStyle}>Qur{"\u2019"}an</Text>
          <Text style={bodyStyle}> in </Text>
          <Text style={accentStyle}>{shown.q}</Text>
          <Text style={bodyStyle}> days</Text>
        </Text>
      </View>
      <View style={styles.screenTimeReflectBlock}>
        <Text style={styles.screenTimeReflectParagraph}>
          <Text style={bodyStyle}>If you traded some </Text>
          <Text style={accentStyle}>screen time</Text>
          <Text style={bodyStyle}> for time with Allah</Text>
        </Text>
      </View>
    </>
  );
}
