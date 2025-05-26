import { Disease } from "@/utils/constants";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiseaseDetailScreen() {
  const { disease } = useLocalSearchParams();
  const diseaseData: Disease = disease ? JSON.parse(disease as string) : {};

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

  const getCategoryIcon = (category: string) => {
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

  const InfoCard = ({
    title,
    items,
    icon,
  }: {
    title: string;
    items: string[];
    icon: string;
  }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons
            name={icon as any}
            size={20}
            color={CATEGORY_COLORS[diseaseData.category]}
          />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text style={styles.listItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const CropChip = ({ crop }: { crop: string }) => (
    <View style={styles.cropChip}>
      <Text style={styles.cropChipText}>{crop}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {diseaseData.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Disease Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.diseaseHeader}>
            <View
              style={[
                styles.diseaseIcon,
                {
                  backgroundColor: `${CATEGORY_COLORS[diseaseData.category]}15`,
                },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(diseaseData.category)}
                size={28}
                color={CATEGORY_COLORS[diseaseData.category]}
              />
            </View>
            <View style={styles.diseaseInfo}>
              <Text style={styles.diseaseName}>{diseaseData.name}</Text>
              {diseaseData.scientificName && (
                <Text style={styles.scientificName}>
                  {diseaseData.scientificName}
                </Text>
              )}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: CATEGORY_COLORS[diseaseData.category] },
                  ]}
                >
                  <Text style={styles.badgeText}>{diseaseData.category}</Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: SEVERITY_COLORS[diseaseData.severity] },
                  ]}
                >
                  <Text style={styles.badgeText}>{diseaseData.severity}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Common Names */}
          {diseaseData.commonNames && diseaseData.commonNames.length > 0 && (
            <View style={styles.commonNamesSection}>
              <Text style={styles.miniSectionTitle}>Also known as:</Text>
              <Text style={styles.commonNamesText}>
                {diseaseData.commonNames.join(", ")}
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{diseaseData.description}</Text>

          {/* Environmental Info */}
          {(diseaseData.seasonality || diseaseData.climateConditions) && (
            <View style={styles.environmentalInfo}>
              {diseaseData.seasonality && (
                <View style={styles.envItem}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.envText}>{diseaseData.seasonality}</Text>
                </View>
              )}
              {diseaseData.climateConditions && (
                <View style={styles.envItem}>
                  <Ionicons
                    name="thermometer-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.envText}>
                    {diseaseData.climateConditions.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Affected Crops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affected Crops</Text>
          <View style={styles.cropsContainer}>
            {diseaseData.affectedCrops?.map((crop, index) => (
              <CropChip key={index} crop={crop} />
            ))}
          </View>
        </View>

        {/* Symptoms */}
        {diseaseData.symptoms && (
          <InfoCard
            title="Symptoms"
            items={diseaseData.symptoms}
            icon="medical-outline"
          />
        )}

        {/* Causes */}
        {diseaseData.causes && (
          <InfoCard
            title="Causes"
            items={diseaseData.causes}
            icon="help-circle-outline"
          />
        )}

        {/* Treatment */}
        {diseaseData.treatment && (
          <InfoCard
            title="Treatment"
            items={diseaseData.treatment}
            icon="medical"
          />
        )}

        {/* Prevention */}
        {diseaseData.prevention && (
          <InfoCard
            title="Prevention"
            items={diseaseData.prevention}
            icon="shield-checkmark-outline"
          />
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
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
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  diseaseHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  diseaseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  commonNamesSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  miniSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  commonNamesText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 16,
  },
  environmentalInfo: {
    gap: 8,
  },
  envItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  envText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
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
  cropsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cropChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  cropChipText: {
    fontSize: 14,
    color: "#4338CA",
    fontWeight: "500",
  },
  infoCard: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
    marginTop: 7,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 20,
    flex: 1,
  },
});
