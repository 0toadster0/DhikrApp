import React from "react";
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

type MascotVariant = "default" | "celebration" | "tasbeeh" | "search" | "onboarding1" | "onboarding2";

interface Props {
  variant?: MascotVariant;
  size?: number;
  style?: ViewStyle;
  float?: boolean;
  glow?: boolean;
}

const mascotSources: Record<MascotVariant, any> = {
  default: require("@/assets/mascot/mascot_default.png"),
  celebration: require("@/assets/mascot/mascot_celebration.png"),
  tasbeeh: require("@/assets/mascot/mascot_tasbeeh.png"),
  search: require("@/assets/mascot/mascot_search.png"),
  onboarding1: require("@/assets/mascot/onboarding1.png"),
  onboarding2: require("@/assets/mascot/onboarding2.png"),
};

export function MascotImage({ variant = "default", size = 160, style, float = false, glow = false }: Props) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (float) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }
  }, [float]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[style, glow && styles.glowContainer]}>
      <Animated.View style={float ? animatedStyle : undefined}>
        <Image
          source={mascotSources[variant]}
          style={{ width: size, height: size, resizeMode: "contain" }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    shadowColor: "#C4A2F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
});
