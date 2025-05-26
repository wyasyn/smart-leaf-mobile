import { addStorageListener, getPlantLogStats } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [totalScans, setTotalScans] = useState(0);
  const [todayScans, setTodayScans] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  /* loadStats is memoised so the reference stays stable */
  const loadStats = useCallback(async () => {
    try {
      const stats = await getPlantLogStats();
      setTotalScans(stats.totalScans);
      setTodayScans(stats.todayScans);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  /* Set up real-time updates listener */
  useEffect(() => {
    const unsubscribe = addStorageListener(loadStats);
    return unsubscribe; // Cleanup listener on unmount
  }, [loadStats]);

  /* Run once on mount *and* every time the screen gets focus */
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  /* Pull-to-refresh handler */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  /* Quick-action config */
  const quickActions: {
    id: number;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
  }[] = [
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

  /* ──────────────── render ──────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>SmartLeaf</Text>
          <Text style={styles.subtitle}>
            AI-Powered Plant Disease Detection
          </Text>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/scan");
          }}
          activeOpacity={0.85}
          style={styles.scanButton}
          accessibilityRole="button"
          accessibilityLabel="Scan a plant leaf"
        >
          <Ionicons name="camera" size={32} color="white" />
          <Text style={styles.scanButtonText}>Scan Plant Leaf</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(({ id, title, icon, action }) => (
              <TouchableOpacity
                key={id}
                style={styles.quickActionCard}
                onPress={() => {
                  Haptics.selectionAsync();
                  action();
                }}
                accessibilityRole="button"
                accessibilityLabel={title}
              >
                <Ionicons name={icon} size={24} color="#22C55E" />
                <Text style={styles.quickActionText}>{title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayScans}</Text>
              <Text style={styles.statLabel}>Scans Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────
   Styles (unchanged)
   ────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 30,
  },
  header: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    marginHorizontal: 20,
    paddingBottom: 28,
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
    paddingVertical: 18,
    borderRadius: 30,
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
    marginBottom: 32,
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
    paddingVertical: 24,
    borderRadius: 14,
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
    marginTop: 10,
    textAlign: "center",
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 26,
    borderRadius: 14,
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
