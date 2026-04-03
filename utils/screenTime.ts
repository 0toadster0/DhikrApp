import { NativeModules } from "react-native";

type ScreenTimeNativeModule = {
  requestAuthorization: () => Promise<boolean>;
};

const { ScreenTimeModule } = NativeModules as {
  ScreenTimeModule?: ScreenTimeNativeModule;
};

export async function requestScreenTimePermission(): Promise<boolean> {
  if (!ScreenTimeModule?.requestAuthorization) {
    throw new Error("ScreenTimeModule is not linked.");
  }

  return ScreenTimeModule.requestAuthorization();
}
