import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#6B7280",
        headerShown: false,

        /** ---------- label ---------- */
        tabBarLabelStyle: { fontSize: 9, fontWeight: "500" },

        /** ---------- container ---------- */
        tabBarStyle: {
          position: "absolute",
          bottom: 12,
          left: 16,
          right: 16,
          height: 60,
          borderRadius: 20,
          overflow: "hidden", // keeps blur inside curve
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "transparent", // let BlurView fully show through
        },

        /** ---------- frosted background ---------- */
        tabBarBackground: () => (
          <BlurView
            // iOS “ultraThinMaterial” is the classic frosted glass;
            // Android uses the closest approximation.
            tint={Platform.OS === "ios" ? "systemMaterialLight" : "light"}
            intensity={60} // 40–80 feels right
            style={StyleSheet.absoluteFill} // full cover
          >
            {/* subtle translucent film so content below is desaturated */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(255,255,255,0.7)", // ⇦ tweak alpha to taste
              }}
            />
          </BlurView>
        ),
      }}
    >
      {/**  ----- screens ----- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "camera" : "camera-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: "Logbook",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diseases"
        options={{
          title: "Diseases",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused ? "information-circle" : "information-circle-outline"
              }
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
