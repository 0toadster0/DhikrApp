import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { styles } from "./onboardingStyles";

export function CenteredStep({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={[styles.centeredStep, style]}>
      {children}
    </Animated.View>
  );
}
