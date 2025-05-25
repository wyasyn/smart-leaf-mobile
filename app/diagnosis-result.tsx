import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiagnosisResultScreen() {
  const { imageUri, diagnosis } = useLocalSearchParams();
  const parsedDiagnosis = diagnosis ? JSON.parse(diagnosis as string) : {};

  const saveToLogbook = async () => {
    try {
      const logEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        image: imageUri,
        disease: parsedDiagnosis.disease_name || "Unknown",
        confidence: parsedDiagnosis.confidence || 0,
        treatment: parsedDiagnosis.treatment || "No treatment available",
        description: parsedDiagnosis.description || "",
        symptoms: parsedDiagnosis.symptoms || "",
      };

      const existingLogs = await AsyncStorage.getItem("plantLogs");
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.unshift(logEntry);

      await AsyncStorage.setItem("plantLogs", JSON.stringify(logs));
      Alert.alert("Success", "Diagnosis saved to logbook!", [
        { text: "OK", onPress: () => router.push("/logbook") },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save to logbook");
    }
  };

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
          />
        </View>

        <View style={styles.resultContainer}>
          <View style={styles.diseaseHeader}>
            <Text style={styles.diseaseName}>
              {parsedDiagnosis.disease_name || "Disease Not Detected"}
            </Text>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence:</Text>
              <Text style={styles.confidenceValue}>
                {Math.round((parsedDiagnosis.confidence || 0) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionContent}>
              {parsedDiagnosis.description ||
                "No description available for this condition."}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            <Text style={styles.sectionContent}>
              {parsedDiagnosis.symptoms || "No specific symptoms identified."}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Treatment</Text>
            <Text style={styles.sectionContent}>
              {parsedDiagnosis.treatment ||
                "Consult with an agricultural expert for proper treatment."}
            </Text>
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
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
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
