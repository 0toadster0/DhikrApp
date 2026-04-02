import { Platform } from "react-native";

/** Align Android Text vertical metrics with the phone-hours headline/sub reference. */
export const androidPhoneHoursTextFix =
  Platform.OS === "android" ? ({ includeFontPadding: false } as const) : {};
