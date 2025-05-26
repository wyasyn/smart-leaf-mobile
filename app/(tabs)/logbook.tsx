import { addStorageListener, getPlantLogs, PlantLog } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
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

interface LogItemWithImageStatus extends PlantLog {
  imageLoadError?: boolean;
}

export default function LogbookScreen() {
  const [logs, setLogs] = useState<LogItemWithImageStatus[]>([]);

  const loadLogs = useCallback(async () => {
    try {
      const savedLogs = await getPlantLogs();

      // Check if images exist and add status
      const logsWithImageStatus = await Promise.all(
        savedLogs.map(async (log) => {
          try {
            const imageInfo = await FileSystem.getInfoAsync(log.image);
            return {
              ...log,
              imageLoadError: !imageInfo.exists,
            };
          } catch (error) {
            console.log(`Image check failed for ${log.id}:`, error);
            return {
              ...log,
              imageLoadError: true,
            };
          }
        })
      );

      setLogs(logsWithImageStatus);
      console.log(
        "Loaded logs with image status:",
        logsWithImageStatus.map((log) => ({
          id: log.id,
          imageExists: !log.imageLoadError,
          imagePath: log.image,
        }))
      );
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

  const handleImageError = (logId: string) => {
    console.log(`Image load failed for log ${logId}`);
    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId ? { ...log, imageLoadError: true } : log
      )
    );
  };

  const renderLogItem = ({ item }: { item: LogItemWithImageStatus }) => {
    console.log(
      `Rendering log ${item.id} - Image error status:`,
      item.imageLoadError
    );

    return (
      <View style={styles.logItem}>
        <View style={styles.imageContainer}>
          {!item.imageLoadError ? (
            <>
              <Image
                source={{ uri: item.image }}
                style={styles.logImage}
                onError={(error) => {
                  console.error(
                    `Image load error for log ${item.id}:`,
                    error.nativeEvent.error
                  );
                  console.log("Failed image URI:", item.image);
                  handleImageError(item.id);
                }}
                onLoad={() => {
                  console.log(
                    `Image loaded successfully for log ${item.id}:`,
                    item.image
                  );
                }}
                resizeMode="cover"
              />
              {/* Fallback that appears behind the image */}
              <View style={styles.imageFallback}>
                <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
              </View>
            </>
          ) : (
            // Show fallback immediately if we know the image doesn't exist
            <View style={[styles.logImage, styles.imageFallbackVisible]}>
              <Ionicons name="leaf-outline" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logDisease}>{item.disease}</Text>
          <Text style={styles.logDate}>{formatDate(item.date)}</Text>
          <Text style={styles.logConfidence}>
            Confidence: {Math.round(item.confidence * 100)}%
          </Text>
          {item.imageLoadError && (
            <Text style={styles.imageErrorText}>Image unavailable</Text>
          )}
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
  imageFallbackVisible: {
    // When we know the image is missing, show the fallback directly
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
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
  imageErrorText: {
    fontSize: 12,
    color: "#EF4444",
    fontStyle: "italic",
    marginTop: 2,
  },
});
