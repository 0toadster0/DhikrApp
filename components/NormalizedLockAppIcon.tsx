import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

export type LockAppId = "instagram" | "tiktok" | "snapchat" | "x";

const IG_LOGO = require("@/assets/images/onboarding-apps/instagram-updated.png");
const TT_LOGO = require("@/assets/images/onboarding-apps/tiktok-updated.png");
const SNAPCHAT_LOGO = require("@/assets/images/onboarding-apps/snapchat-updated.png");
const X_LOGO = require("@/assets/images/onboarding-apps/x-updated.png");

const LOCK_APP_ICON_SOURCES: Record<LockAppId, ImageSourcePropType> = {
  instagram: IG_LOGO as ImageSourcePropType,
  tiktok: TT_LOGO as ImageSourcePropType,
  snapchat: SNAPCHAT_LOGO as ImageSourcePropType,
  x: X_LOGO as ImageSourcePropType,
};

export function NormalizedLockAppIcon({
  id,
  clipSize = 64,
  clipBorderRadius = 18,
  imageBaseSize = 64,
}: {
  id: LockAppId;
  clipSize?: number;
  clipBorderRadius?: number;
  imageBaseSize?: number;
}) {
  const source = LOCK_APP_ICON_SOURCES[id];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.clip,
        {
          width: clipSize,
          height: clipSize,
          borderRadius: clipBorderRadius,
        },
      ]}
    >
      <Image
        source={source}
        style={[
          styles.image,
          {
            width: imageBaseSize,
            height: imageBaseSize,
            borderRadius: clipBorderRadius,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    opacity: 1,
  },
});

