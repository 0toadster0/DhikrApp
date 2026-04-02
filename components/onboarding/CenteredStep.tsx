import React from "react";
import Animated, { FadeIn } from "react-native-reanimated";

import { styles } from "./onboardingStyles";

export function CenteredStep({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.centeredStep}>
      {children}
    </Animated.View>
  );
}
