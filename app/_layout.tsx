import { HAS_ONBOARDED } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<"onboarding" | "(tabs)">(
    "onboarding"
  );

  useEffect(() => {
    (async () => {
      const flag = await AsyncStorage.getItem(HAS_ONBOARDED);
      setInitialRoute(flag === "true" ? "(tabs)" : "onboarding");
      setReady(true);
    })();
  }, []);

  if (!ready) return null; // or a splash component

  return (
    <Stack
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="diagnosis-result" />
      <Stack.Screen name="disease-detail" />
    </Stack>
  );
}
