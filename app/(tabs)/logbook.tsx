import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LogEntry {
  id: number;
  date: string;
  image: string;
  disease: string;
  confidence: number;
  treatment: string;
  description: string;
  symptoms: string;
}

export default function LogbookScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const loadLogs = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem("plantLogs");
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderLogItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.logItem}>
      <Image source={{ uri: item.image }} style={styles.logImage} />
      <View style={styles.logContent}>
        <Text style={styles.logDisease}>{item.disease}</Text>
        <Text style={styles.logDate}>{formatDate(item.date)}</Text>
        <Text style={styles.logConfidence}>
          Confidence: {Math.round(item.confidence * 100)}%
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Logbook</Text>
        <Text style={styles.subtitle}>Your scan history</Text>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>
            Start scanning plants to build your logbook
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logItem: {
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
  logImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  logContent: {
    flex: 1,
  },
  logDisease: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  logDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  logConfidence: {
    fontSize: 14,
    color: "#22C55E",
    fontWeight: "500",
  },
});
