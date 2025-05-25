import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all scan history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("plantLogs");
              Alert.alert("Success", "History cleared successfully");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear history");
            }
          },
        },
      ]
    );
  };

  const resetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will show the welcome screens again on next app launch.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("hasOnboarded");
              Alert.alert("Success", "Onboarding reset successfully");
            } catch (error) {
              console.error("Error resetting onboarding:", error);
              Alert.alert("Error", "Failed to reset onboarding");
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 1,
      title: "Clear Scan History",
      subtitle: "Remove all saved scans from logbook",
      icon: "trash-outline",
      action: clearHistory,
      color: "#EF4444",
    },
    {
      id: 2,
      title: "Reset Onboarding",
      subtitle: "Show welcome screens again",
      icon: "refresh-outline",
      action: resetOnboarding,
      color: "#F59E0B",
    },
    {
      id: 3,
      title: "About",
      subtitle: "App version and information",
      icon: "information-circle-outline",
      action: () => {
        Alert.alert(
          "SmartLeaf",
          "Version 1.0.0\n\nAI-powered plant disease detection app.\n\nDeveloped with React Native and Expo.",
          [{ text: "OK" }]
        );
      },
      color: "#6B7280",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingItem}
              onPress={option.action}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: `${option.color}15` },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={option.color}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SmartLeaf v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>
            Made with ❤️ for farmers and gardeners
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  settingsContainer: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
