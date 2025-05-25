import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LOGO = require("../../assets/images/icon.png");

type PickerAsset = ImagePicker.ImagePickerAsset | null;

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<PickerAsset>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);

  /* ───────── permissions ───────── */
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    /* cancel fetch if user leaves screen */
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ───────── helpers ───────── */
  const launchPicker = async (fromCamera: boolean) => {
    const pickerFn = fromCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await pickerFn({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      Haptics.selectionAsync();
      setSelectedImage(result.assets[0]);
    }
  };

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: "leaf.jpg",
      } as any);

      const response = await fetch("YOUR_FASTAPI_BACKEND_URL/predict", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();

      /** avoid navigating if the component unmounted */
      if (mounted.current) {
        router.push({
          pathname: "/diagnosis-result",
          params: {
            imageUri: selectedImage.uri,
            diagnosis: JSON.stringify(result),
          },
        });
      }
    } catch (error) {
      mounted.current &&
        Alert.alert("Error", "Failed to analyze image. Please try again.");
      console.error("Analysis error:", error);
    } finally {
      mounted.current && setIsLoading(false);
    }
  }, [selectedImage]);

  /* ───────── UI ───────── */
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centerContent}>
        <Text>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centerContent}>
        <Text>No access to camera</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Header */}
          <Image source={LOGO} style={styles.logo} />
          <Text style={styles.title}>Scan Plant Leaf</Text>
          <Text style={styles.subtitle}>Take a photo or upload an image</Text>

          {/* Preview */}
          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedImage(null)}
                accessibilityRole="button"
                accessibilityLabel="Remove selected image"
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Picker buttons */}
          <View style={styles.buttonsContainer}>
            <ActionBtn
              icon="camera"
              label="Take Photo"
              onPress={() => launchPicker(true)}
            />
            <ActionBtn
              icon="image"
              label="Choose from Gallery"
              onPress={() => launchPicker(false)}
            />
          </View>

          {/* Analyse */}
          {selectedImage && (
            <TouchableOpacity
              style={[styles.analyzeButton, isLoading && styles.disabledButton]}
              onPress={analyzeImage}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Analyze selected image"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="analytics" size={24} color="white" />
                  <Text style={styles.analyzeButtonText}>Analyze Image</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────── small presentational component ───────── */
const ActionBtn = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.actionButton}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    activeOpacity={0.85}
  >
    <Ionicons name={icon} size={24} color="white" />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    gap: 20,
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 12,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    gap: 12,
  },
  analyzeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
