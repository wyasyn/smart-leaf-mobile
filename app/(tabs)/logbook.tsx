import { addStorageListener, getPlantLogs, PlantLog } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LogbookScreen() {
  const [logs, setLogs] = useState<PlantLog[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      const savedLogs = await getPlantLogs();
      setLogs(savedLogs);
      console.log("Loaded logs:", savedLogs); // Debug log
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  }, []);

  /* Set up real-time updates listener */
  useEffect(() => {
    const unsubscribe = addStorageListener(loadLogs);
    return unsubscribe; // Cleanup listener on unmount
  }, [loadLogs]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderLogItem = ({ item }: { item: PlantLog }) => {
    console.log("Rendering log item with image URI:", item.image); // Debug log

    return (
      <View style={styles.logItem}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.logImage}
            onError={(error) => {
              console.error("Image load error:", error.nativeEvent.error);
              console.log("Failed image URI:", item.image);
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", item.image);
            }}
            // Add these props for better compatibility
            resizeMode="cover"
          />
          {/* Fallback icon if image fails to load */}
          <View style={styles.imageFallback}>
            <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
          </View>
        </View>
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 24,
            paddingBottom: 100,
          },
        ]}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Plant Logbook</Text>
            <Text style={styles.subtitle}>Your scan history</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>
              Start scanning plants to build your logbook
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingBottom: 20,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
    paddingVertical: 100,
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
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  logImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6", // Light gray background
  },
  imageFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    zIndex: -1, // Behind the actual image
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
