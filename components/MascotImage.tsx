import React, { useEffect } from "react";
import { Image, ImageResizeMode, ImageStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { mascots, type MascotKey } from "@/constants/mascots";

interface Props {
  variant?: MascotKey;
  size?: number;
  style?: ImageStyle;
  float?: boolean;
  pulse?: boolean;
  resizeMode?: ImageResizeMode;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function MascotImage({
  variant = "basic",
  size = 160,
  style,
  float = false,
  pulse = false,
  resizeMode = "contain",
}: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (float) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      translateY.value = 0;
    }
  }, [float]);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      scale.value = 1;
    }
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    backgroundColor: "transparent",
  };

  return (
    <AnimatedImage
      source={mascots[variant]}
      style={[imageStyle, style, float || pulse ? animatedStyle : undefined]}
      resizeMode={resizeMode}
    />
  );
}
