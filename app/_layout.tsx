import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
      if (!hasOnboarded) {
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="diagnosis-result" options={{ headerShown: false }} />
      <Stack.Screen name="disease-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
