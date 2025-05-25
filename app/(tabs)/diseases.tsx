import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string;
  treatment: string;
}

const diseases: Disease[] = [
  {
    id: 1,
    name: "Apple Scab",
    description:
      "A fungal disease that affects apple trees, causing dark spots on leaves and fruit.",
    symptoms:
      "Dark, olive-green spots on leaves, fruit cracking, premature leaf drop",
    treatment:
      "Apply fungicide sprays in early spring, remove infected leaves, improve air circulation",
  },
  {
    id: 2,
    name: "Tomato Late Blight",
    description:
      "A destructive disease affecting tomato plants, causing rapid leaf browning and fruit rot.",
    symptoms:
      "Brown spots on leaves with white fuzzy growth underneath, yellowing, fruit rot",
    treatment:
      "Use copper-based fungicides, improve air circulation, avoid overhead watering",
  },
  {
    id: 3,
    name: "Corn Rust",
    description:
      "A fungal disease that creates rust-colored pustules on corn leaves.",
    symptoms:
      "Orange-brown pustules on leaves, reduced photosynthesis, potential yield loss",
    treatment:
      "Plant resistant varieties, apply fungicides if severe, remove crop debris",
  },
  {
    id: 4,
    name: "Potato Early Blight",
    description:
      "A common fungal disease causing dark spots with concentric rings on potato leaves.",
    symptoms:
      "Dark brown spots with target-like rings, yellowing leaves, defoliation",
    treatment:
      "Apply preventive fungicides, rotate crops, ensure proper plant spacing",
  },
  {
    id: 5,
    name: "Grape Powdery Mildew",
    description:
      "A fungal disease creating white powdery coating on grape leaves and fruit.",
    symptoms:
      "White powdery growth on leaves and fruit, stunted growth, fruit cracking",
    treatment:
      "Apply sulfur-based fungicides, prune for air circulation, resistant varieties",
  },
];

export default function DiseasesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDiseases, setFilteredDiseases] = useState(diseases);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = diseases.filter(
      (disease) =>
        disease.name.toLowerCase().includes(query.toLowerCase()) ||
        disease.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDiseases(filtered);
  };

  const renderDiseaseItem = ({ item }: { item: Disease }) => (
    <TouchableOpacity
      style={styles.diseaseItem}
      onPress={() =>
        router.push({
          pathname: "/disease-detail",
          params: { disease: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.diseaseIcon}>
        <Ionicons name="leaf" size={24} color="#22C55E" />
      </View>
      <View style={styles.diseaseContent}>
        <Text style={styles.diseaseName}>{item.name}</Text>
        <Text style={styles.diseaseDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disease Information</Text>
        <Text style={styles.subtitle}>Browse plant diseases</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search diseases..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredDiseases}
        renderItem={renderDiseaseItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  diseaseItem: {
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
  diseaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  diseaseContent: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
