import { PlantLog, savePlantLog } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types matching the API response
interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  all_predictions: Record<string, number>;
  message: string;
}

export default function DiagnosisResultScreen() {
  const { imageUri, diagnosis } = useLocalSearchParams();

  const parsedDiagnosis: PredictionResponse = useMemo(() => {
    try {
      return diagnosis ? JSON.parse(diagnosis as string) : null;
    } catch (error) {
      console.error("Error parsing diagnosis:", error);
      return null;
    }
  }, [diagnosis]);

  // Get top 5 predictions sorted by confidence
  const topPredictions = useMemo(() => {
    if (!parsedDiagnosis?.all_predictions) return [];

    return Object.entries(parsedDiagnosis.all_predictions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, confidence]) => ({ name, confidence }));
  }, [parsedDiagnosis]);

  // Extract plant and condition info
  const plantInfo = useMemo(() => {
    if (!parsedDiagnosis?.clean_class_name)
      return { plant: "Unknown", condition: "Unknown" };

    const parts = parsedDiagnosis.clean_class_name.split(" - ");
    return {
      plant: parts[0] || "Unknown Plant",
      condition: parts[1] || "Unknown Condition",
    };
  }, [parsedDiagnosis]);

  // Determine if the plant is healthy
  const isHealthy = useMemo(() => {
    return (
      parsedDiagnosis?.clean_class_name.toLowerCase().includes("healthy") ||
      false
    );
  }, [parsedDiagnosis]);

  const saveToLogbook = async () => {
    if (!parsedDiagnosis || !imageUri) {
      Alert.alert("Error", "No diagnosis data or image to save");
      return;
    }

    try {
      console.log("=== Starting save to logbook process ===");
      console.log("Using image URI:", imageUri);

      const newLog: PlantLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        image: imageUri as string, // Image is already saved permanently
        disease: parsedDiagnosis.clean_class_name,
        confidence: parsedDiagnosis.confidence,
        result: parsedDiagnosis.predicted_class,
        // Optional fields:
        treatment: isHealthy
          ? "Continue your current care routine. Monitor regularly for any changes in leaf color, texture, or growth patterns. Ensure proper watering, adequate light, and good air circulation."
          : "Consider consulting with a local agricultural expert or plant pathologist for specific treatment recommendations. Early intervention often leads to better outcomes.",
        description:
          parsedDiagnosis.message ||
          (isHealthy
            ? `Your ${plantInfo.plant.toLowerCase()} appears to be in good health! No signs of disease or pest damage were detected in the leaf analysis.`
            : `The analysis detected signs of ${plantInfo.condition.toLowerCase()} in your ${plantInfo.plant.toLowerCase()}. This condition may require attention to prevent further damage.`),
        symptoms: isHealthy
          ? "No visible symptoms detected"
          : `Signs of ${plantInfo.condition.toLowerCase()} detected`,
      };

      console.log("Saving plant log:", newLog);

      await savePlantLog(newLog);
      console.log("Plant log saved successfully");

      Alert.alert("Success", "Diagnosis saved to logbook!", [
        { text: "OK", onPress: () => router.push("/logbook") },
      ]);
    } catch (error) {
      console.error("Failed to save plant log:", error);
      Alert.alert("Error", "Failed to save to logbook");
    }
  };

  if (!parsedDiagnosis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Diagnosis Result</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>No diagnosis data available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Diagnosis Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri as string }}
            style={styles.leafImage}
            onError={(error) => {
              console.error(
                "Main image display error:",
                error.nativeEvent.error
              );
              console.log("Failed to display image URI:", imageUri);
            }}
            onLoad={() => {
              console.log("Main image loaded successfully:", imageUri);
            }}
            resizeMode="cover"
          />
        </View>

        <View style={styles.resultContainer}>
          {/* Main Result */}
          <View
            style={[styles.diseaseHeader, isHealthy && styles.healthyHeader]}
          >
            <View style={styles.statusContainer}>
              <Ionicons
                name={isHealthy ? "checkmark-circle" : "alert-circle"}
                size={24}
                color={isHealthy ? "#22C55E" : "#F59E0B"}
              />
              <Text style={styles.statusText}>
                {isHealthy ? "Healthy Plant" : "Issue Detected"}
              </Text>
            </View>

            <Text style={styles.plantName}>{plantInfo.plant}</Text>
            <Text style={styles.conditionName}>{plantInfo.condition}</Text>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence:</Text>
              <Text
                style={[
                  styles.confidenceValue,
                  isHealthy && styles.healthyConfidence,
                ]}
              >
                {Math.round(parsedDiagnosis.confidence * 100)}%
              </Text>
            </View>
          </View>

          {/* Analysis Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analysis Summary</Text>
            <Text style={styles.sectionContent}>
              {isHealthy
                ? `Your ${plantInfo.plant.toLowerCase()} appears to be in good health! No signs of disease or pest damage were detected in the leaf analysis.`
                : `The analysis detected signs of ${plantInfo.condition.toLowerCase()} in your ${plantInfo.plant.toLowerCase()}. This condition may require attention to prevent further damage.`}
            </Text>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isHealthy ? "Care Tips" : "Recommendations"}
            </Text>
            <Text style={styles.sectionContent}>
              {isHealthy
                ? "Continue your current care routine. Monitor regularly for any changes in leaf color, texture, or growth patterns. Ensure proper watering, adequate light, and good air circulation."
                : "Consider consulting with a local agricultural expert or plant pathologist for specific treatment recommendations. Early intervention often leads to better outcomes."}
            </Text>
          </View>

          {/* Top Predictions */}
          {topPredictions.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alternative Possibilities</Text>
              {topPredictions.slice(1, 4).map((prediction, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text style={styles.predictionName}>{prediction.name}</Text>
                  <Text style={styles.predictionConfidence}>
                    {Math.round(prediction.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Technical Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Details</Text>
            <View style={styles.technicalRow}>
              <Text style={styles.technicalLabel}>Model Prediction:</Text>
              <Text style={styles.technicalValue}>
                {parsedDiagnosis.predicted_class}
              </Text>
            </View>
            <View style={styles.technicalRow}>
              <Text style={styles.technicalLabel}>Analysis Date:</Text>
              <Text style={styles.technicalValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveToLogbook}>
          <Ionicons name="bookmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save to Logbook</Text>
        </TouchableOpacity>
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
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  leafImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
  },
  resultContainer: {
    paddingHorizontal: 20,
  },
  diseaseHeader: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  healthyHeader: {
    borderLeftColor: "#22C55E",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  plantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  conditionName: {
    fontSize: 18,
    color: "#4B5563",
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  healthyConfidence: {
    color: "#22C55E",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  predictionName: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  technicalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  technicalLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  technicalValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
