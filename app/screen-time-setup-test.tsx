import { useState } from "react";
import { Button, Text, View } from "react-native";
import { requestScreenTimePermission } from "@/utils/screenTime";

type PermissionStatus = "unknown" | "granted" | "denied";

export default function ScreenTimeSetupTest() {
  const [status, setStatus] = useState<PermissionStatus>("unknown");

  const handleRequestAccess = async () => {
    try {
      const granted = await requestScreenTimePermission();
      setStatus(granted ? "granted" : "denied");
    } catch {
      setStatus("denied");
    }
  };

  return (
    <View>
      <Button title="Request Screen Time Access" onPress={handleRequestAccess} />
      <Text>{status}</Text>
    </View>
  );
}
