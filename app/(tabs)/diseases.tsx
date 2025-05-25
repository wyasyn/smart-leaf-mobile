import { diseases } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
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

export default function DiseasesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  /** -------- derived list (re-computed only when query changes) ---------- */
  const filteredDiseases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return diseases;
    return diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  /** --------------------- render helpers --------------------------------- */
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

  const Header = () => (
    <>
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
          onChangeText={setSearchQuery}
        />
      </View>
    </>
  );

  const Empty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyText}>No diseases found</Text>
      <Text style={styles.emptySubtext}>Try a different search term</Text>
    </View>
  );

  /** --------------------------- UI --------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <FlatList
        data={filteredDiseases}
        renderItem={renderDiseaseItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingTop:
              Platform.OS === "android"
                ? (StatusBar.currentHeight ?? 24) + 8
                : 24,
            paddingBottom: 100,
          },
        ]}
        ListHeaderComponent={Header}
        ListEmptyComponent={Empty}
      />
    </SafeAreaView>
  );
}

/* ----------------------------- styles ---------------------------------- */
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",

    paddingHorizontal: 16,
    paddingVertical: 4,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
