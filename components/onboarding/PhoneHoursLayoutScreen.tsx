import React from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { androidPhoneHoursTextFix } from "./shared/androidPhoneHoursTextFix";
import { styles } from "./onboardingStyles";

export function PhoneHoursLayoutScreen({
  title,
  subtitle,
  titleStyle,
  expandMiddleContent,
  children,
}: {
  title: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
  /** When true, middle column fills remaining height (e.g. frequency step hero + controls). */
  expandMiddleContent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.phoneHoursScreen}>
      {subtitle ? (
        <View style={styles.phoneHoursTextBlock}>
          <Text
            style={[styles.phoneHoursHeading, androidPhoneHoursTextFix, styles.phoneHoursHeadingAboveSub, titleStyle]}
          >
            {title}
          </Text>
          <Text style={[styles.phoneHoursSub, androidPhoneHoursTextFix, styles.phoneHoursSubAboveMiddle]}>
            {subtitle}
          </Text>
        </View>
      ) : (
        <Text style={[styles.phoneHoursHeading, androidPhoneHoursTextFix, titleStyle]}>{title}</Text>
      )}
      <View style={[styles.phoneHoursMiddle, expandMiddleContent && styles.phoneHoursMiddleExpanded]}>
        <View style={[styles.phoneHoursStep, expandMiddleContent && styles.phoneHoursStepExpanded]}>{children}</View>
      </View>
    </Animated.View>
  );
}
