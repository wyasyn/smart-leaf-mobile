import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [totalScans, setTotalScans] = useState(0);
  const [todayScans, setTodayScans] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const logs = await AsyncStorage.getItem("plantLogs");
      if (logs) {
        const parsedLogs = JSON.parse(logs);
        setTotalScans(parsedLogs.length);

        const today = new Date().toDateString();
        const todayCount = parsedLogs.filter(
          (log: any) => new Date(log.date).toDateString() === today
        ).length;
        setTodayScans(todayCount);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Scan Leaf",
      icon: "camera",
      action: () => router.push("/scan"),
    },
    {
      id: 2,
      title: "View History",
      icon: "book",
      action: () => router.push("/logbook"),
    },
    {
      id: 3,
      title: "Disease Info",
      icon: "information-circle",
      action: () => router.push("/diseases"),
    },
    {
      id: 4,
      title: "Settings",
      icon: "settings",
      action: () => router.push("/settings"),
    },
  ];

  return (
    <SafeAreaView style={homeStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.greeting}>Welcome to</Text>
          <Text style={homeStyles.appName}>SmartLeaf</Text>
          <Text style={homeStyles.subtitle}>
            AI-Powered Plant Disease Detection
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/scan")}
          activeOpacity={0.8}
          style={homeStyles.scanButton}
        >
          <Ionicons name="camera" size={32} color="white" />
          <Text style={homeStyles.scanButtonText}>Scan Plant Leaf</Text>
        </TouchableOpacity>

        <View style={homeStyles.quickActionsContainer}>
          <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
          <View style={homeStyles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={homeStyles.quickActionCard}
                onPress={action.action}
              >
                <Ionicons name={action.icon as any} size={24} color="#22C55E" />
                <Text style={homeStyles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={homeStyles.statsContainer}>
          <Text style={homeStyles.sectionTitle}>Your Activity</Text>
          <View style={homeStyles.statsRow}>
            <View style={homeStyles.statCard}>
              <Text style={homeStyles.statNumber}>{todayScans}</Text>
              <Text style={homeStyles.statLabel}>Scans Today</Text>
            </View>
            <View style={homeStyles.statCard}>
              <Text style={homeStyles.statNumber}>{totalScans}</Text>
              <Text style={homeStyles.statLabel}>Total Scans</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    marginHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 30,
    gap: 12,
  },
  scanButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22C55E",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
