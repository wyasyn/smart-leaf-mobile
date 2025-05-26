// Enhanced React Native Component
import { Disease, diseases } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiseasesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  const CATEGORY_COLORS = {
    Fungal: "#EF4444",
    Bacterial: "#F59E0B",
    Viral: "#8B5CF6",
    Nutritional: "#10B981",
    Environmental: "#06B6D4",
    "Pest-Related": "#EC4899",
  };

  const SEVERITY_COLORS = {
    Low: "#10B981",
    Medium: "#F59E0B",
    High: "#EF4444",
  };

  const categories = [
    "All",
    "Fungal",
    "Bacterial",
    "Viral",
    "Nutritional",
    "Environmental",
    "Pest-Related",
  ];
  const severityLevels = ["All", "Low", "Medium", "High"];

  /** -------- derived list (re-computed when filters change) ---------- */
  const filteredDiseases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return diseases.filter((disease) => {
      // Text search
      const matchesSearch =
        !q ||
        disease.name.toLowerCase().includes(q) ||
        disease.description.toLowerCase().includes(q) ||
        disease.scientificName?.toLowerCase().includes(q) ||
        disease.affectedCrops.some((crop) => crop.toLowerCase().includes(q)) ||
        disease.symptoms.some((symptom) => symptom.toLowerCase().includes(q));

      // Category filter
      const matchesCategory =
        selectedCategory === "All" || disease.category === selectedCategory;

      // Severity filter
      const matchesSeverity =
        selectedSeverity === "All" || disease.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [searchQuery, selectedCategory, selectedSeverity]);

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
      <View
        style={[
          styles.diseaseIcon,
          { backgroundColor: `${CATEGORY_COLORS[item.category]}15` },
        ]}
      >
        <Ionicons
          name={getCategoryIcon(item.category)}
          size={24}
          color={CATEGORY_COLORS[item.category]}
        />
      </View>

      <View style={styles.diseaseContent}>
        <View style={styles.diseaseHeader}>
          <Text style={styles.diseaseName}>{item.name}</Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: SEVERITY_COLORS[item.severity] },
              ]}
            >
              <Text style={styles.severityText}>{item.severity}</Text>
            </View>
          </View>
        </View>

        {item.scientificName && (
          <Text style={styles.scientificName}>{item.scientificName}</Text>
        )}

        <Text style={styles.diseaseDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.affectedCrops}>
          <Text style={styles.cropsLabel}>Affects: </Text>
          <Text style={styles.cropsText} numberOfLines={1}>
            {item.affectedCrops.slice(0, 3).join(", ")}
            {item.affectedCrops.length > 3 ? "..." : ""}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const getCategoryIcon = (
    category: string
  ):
    | "leaf"
    | "bug"
    | "warning"
    | "nutrition"
    | "partly-sunny"
    | "bug-outline" => {
    const icons = {
      Fungal: "leaf",
      Bacterial: "bug",
      Viral: "warning",
      Nutritional: "nutrition",
      Environmental: "partly-sunny",
      "Pest-Related": "bug-outline",
    } as const;
    return icons[category as keyof typeof icons] || "leaf";
  };

  const FilterChip = ({
    title,
    selected,
    onPress,
    color = "#6366F1",
  }: {
    title: string;
    selected: boolean;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? color : "white",
          borderColor: selected ? color : "#E5E7EB",
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: selected ? "white" : "#6B7280" },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const Header = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Plant Disease Database</Text>
        <Text style={styles.subtitle}>
          Comprehensive information on {diseases.length} plant diseases
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search diseases, crops, or symptoms..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersSection}>
        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {categories.map((category) => (
            <FilterChip
              key={category}
              title={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              color={
                category === "All"
                  ? "#6366F1"
                  : CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
              }
            />
          ))}
        </ScrollView>

        <Text style={styles.filterTitle}>Severity</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {severityLevels.map((severity) => (
            <FilterChip
              key={severity}
              title={severity}
              selected={selectedSeverity === severity}
              onPress={() => setSelectedSeverity(severity)}
              color={
                severity === "All"
                  ? "#6366F1"
                  : SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
              }
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredDiseases.length} disease
          {filteredDiseases.length !== 1 ? "s" : ""} found
        </Text>
      </View>
    </>
  );

  const Empty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyText}>No diseases found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your search terms or filters
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery("");
          setSelectedCategory("All");
          setSelectedSeverity("All");
        }}
      >
        <Text style={styles.clearFiltersText}>Clear all filters</Text>
      </TouchableOpacity>
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
  filtersSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultsHeader: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
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
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: "white",
    fontWeight: "500",
  },
  diseaseItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginTop: 4,
  },
  diseaseContent: {
    flex: 1,
  },
  diseaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
  },
  scientificName: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 6,
  },
  diseaseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  affectedCrops: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cropsLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  cropsText: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "500",
    flex: 1,
  },
});
