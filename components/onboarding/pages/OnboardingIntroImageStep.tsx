import React from "react";
import { Image, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ONBOARDING_IMAGE_1, ONBOARDING_IMAGE_2 } from "@/constants/onboarding/content";

import { styles } from "../onboardingStyles";

export function OnboardingIntroImageStep({
  variant,
  introEmphasisColor,
  imageSlideIntroTop,
  imageSlideTextMaxW,
}: {
  variant: 0 | 1;
  introEmphasisColor: string;
  imageSlideIntroTop: number;
  imageSlideTextMaxW: number;
}) {
  if (variant === 0) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.imageSlideArtWrap}>
          <Image source={ONBOARDING_IMAGE_1} style={styles.fullImage} resizeMode="cover" />
        </View>
        <LinearGradient colors={["transparent", "rgba(13,6,32,0.65)", "#0d0620"]} style={styles.imageOverlay} />
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={[styles.imageSlideIntroWrap, { top: imageSlideIntroTop }]}
        >
          <Text style={[styles.imageSlideIntroText, { maxWidth: imageSlideTextMaxW }]}>
            Social media addiction is taking you away from{" "}
            <Text style={{ color: introEmphasisColor }}>Allah</Text>.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <View style={styles.imageSlideArtWrap}>
        <Image source={ONBOARDING_IMAGE_2} style={styles.fullImage} resizeMode="cover" />
      </View>
      <LinearGradient colors={["transparent", "rgba(13,6,32,0.55)", "#0d0620"]} style={styles.imageOverlay} />
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        style={[styles.imageSlideIntroWrap, { top: imageSlideIntroTop }]}
      >
        <Text style={[styles.imageSlideIntroText, { maxWidth: imageSlideTextMaxW }]}>
          <Text style={{ color: introEmphasisColor }}>Dhikr App</Text> can help you choose your faith first daily.
        </Text>
      </Animated.View>
    </View>
  );
}
