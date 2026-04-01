import type { ImageSourcePropType } from "react-native";

export const mascots = {
  hero: require("@/assets/mascot/hero mascot image.png"),
  mag: require("@/assets/mascot/islamic app mascot mag glass.png"),
  tasbeeh: require("@/assets/mascot/islamic app mascot tasbeeh.png"),
  basic: require("@/assets/mascot/islamic app mascot.png"),
  celebrate: require("@/assets/mascot/islamic app mascot celbration.png"),
} satisfies Record<string, ImageSourcePropType>;

export type MascotKey = keyof typeof mascots;
