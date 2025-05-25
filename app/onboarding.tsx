import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const slides = [
  {
    id: "1",
    title: "Scan Plant Leaves",
    description:
      "Take a photo or upload an image of your plant leaves to get instant disease detection",
    icon: "camera",
  },
  {
    id: "2",
    title: "Get Instant Results",
    description:
      "Our AI-powered system analyzes your plant and provides accurate disease diagnosis",
    icon: "flash",
  },
  {
    id: "3",
    title: "Track Your Crops",
    description:
      "Keep a detailed logbook of your plant health and treatment history",
    icon: "analytics",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={onboardingStyles.slide}>
      <View style={onboardingStyles.iconContainer}>
        <Ionicons name={item.icon as any} size={80} color="#22C55E" />
      </View>
      <Text style={onboardingStyles.title}>{item.title}</Text>
      <Text style={onboardingStyles.description}>{item.description}</Text>
    </View>
  );

  const nextSlide = async () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      await AsyncStorage.setItem("hasOnboarded", "true");
      router.replace("/(tabs)");
    }
  };

  const skipOnboarding = async () => {
    await AsyncStorage.setItem("hasOnboarded", "true");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={onboardingStyles.container}>
      <TouchableOpacity
        style={onboardingStyles.skipButton}
        onPress={skipOnboarding}
      >
        <Text style={onboardingStyles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={(event) => {
          const slideSize = event.nativeEvent.layoutMeasurement.width;
          const index = event.nativeEvent.contentOffset.x / slideSize;
          setCurrentIndex(Math.round(index));
        }}
      />

      <View style={onboardingStyles.footer}>
        <View style={onboardingStyles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                onboardingStyles.paginationDot,
                index === currentIndex && onboardingStyles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={onboardingStyles.nextButton}
          onPress={nextSlide}
        >
          <Text style={onboardingStyles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
  },
  skipText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    width: Dimensions.get("window").width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#22C55E",
    width: 24,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
