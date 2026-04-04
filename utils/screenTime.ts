import { NativeModules, Platform } from "react-native";

export type FamilyActivitySelectionState = {
  selectionBase64: string | null;
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
};

export type FamilyActivityPickerResult = {
  selectionBase64: string;
  applicationCount: number;
  categoryCount: number;
  webDomainCount: number;
};

type ScreenTimeNativeModule = {
  requestAuthorization: () => Promise<boolean>;
  getFamilyActivitySelectionState: () => Promise<{
    selectionBase64?: string | null;
    applicationCount: number;
    categoryCount: number;
    webDomainCount: number;
  }>;
  setFamilyActivitySelectionBase64: (base64: string | null) => Promise<boolean>;
  presentFamilyActivityPicker: () => Promise<{
    selectionBase64: string;
    applicationCount: number;
    categoryCount: number;
    webDomainCount: number;
  }>;
};

const { ScreenTimeModule } = NativeModules as {
  ScreenTimeModule?: ScreenTimeNativeModule;
};

function getModule(): ScreenTimeNativeModule {
  if (!ScreenTimeModule) {
    throw new Error("ScreenTimeModule is not linked.");
  }
  return ScreenTimeModule;
}

export function isScreenTimeModuleAvailable(): boolean {
  return Platform.OS === "ios" && Boolean(ScreenTimeModule);
}

export async function requestScreenTimePermission(): Promise<boolean> {
  return getModule().requestAuthorization();
}

/**
 * Ensures Family Controls / Screen Time authorization before using the picker or shields.
 * Returns true if authorized. Does not throw on user deny or native failure — returns false instead.
 */
export async function ensureScreenTimeAuthorized(): Promise<boolean> {
  if (!isScreenTimeModuleAvailable()) {
    return false;
  }
  try {
    return await getModule().requestAuthorization();
  } catch {
    return false;
  }
}

/** Reads encoded FamilyActivitySelection + counts from native storage (App Group). */
export async function getFamilyActivitySelectionState(): Promise<FamilyActivitySelectionState> {
  if (Platform.OS !== "ios") {
    return {
      selectionBase64: null,
      applicationCount: 0,
      categoryCount: 0,
      webDomainCount: 0,
    };
  }
  const raw = await getModule().getFamilyActivitySelectionState();
  const b64 = raw.selectionBase64;
  return {
    selectionBase64: typeof b64 === "string" && b64.length > 0 ? b64 : null,
    applicationCount: Number(raw.applicationCount) || 0,
    categoryCount: Number(raw.categoryCount) || 0,
    webDomainCount: Number(raw.webDomainCount) || 0,
  };
}

/** Restores selection from JS persistence and reapplies ManagedSettings shields. */
export async function setFamilyActivitySelectionBase64(base64: string | null): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false;
  }
  return getModule().setFamilyActivitySelectionBase64(base64 ?? "");
}

/** System FamilyActivityPicker; result is the canonical Screen Time selection shape (base64 plist). */
export async function presentFamilyActivityPicker(): Promise<FamilyActivityPickerResult> {
  const raw = await getModule().presentFamilyActivityPicker();
  return {
    selectionBase64: String(raw.selectionBase64 ?? ""),
    applicationCount: Number(raw.applicationCount) || 0,
    categoryCount: Number(raw.categoryCount) || 0,
    webDomainCount: Number(raw.webDomainCount) || 0,
  };
}
