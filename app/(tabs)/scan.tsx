import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
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

// Types for API response matching the FastAPI backend
interface PredictionResponse {
  success: boolean;
  predicted_class: string;
  clean_class_name: string;
  confidence: number;
  all_predictions: Record<string, number>;
  message: string;
}

interface ApiErrorResponse {
  detail: string;
}

type PickerAsset = ImagePicker.ImagePickerAsset | null;

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<PickerAsset>(null);
  const [permanentImageUri, setPermanentImageUri] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
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

  /* ───────── Enhanced function to copy image to permanent location ───────── */
  const copyImageToPermanentLocation = async (
    sourceUri: string
  ): Promise<string> => {
    try {
      console.log("Starting image copy process from:", sourceUri);

      // First, verify the source file exists
      const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
      if (!sourceInfo.exists) {
        throw new Error(`Source image does not exist: ${sourceUri}`);
      }

      console.log("Source file exists, size:", sourceInfo.size);

      // Create a permanent directory for plant images
      const permanentDir = `${FileSystem.documentDirectory}plant_images/`;
      console.log("Target directory:", permanentDir);

      // Ensure the directory exists
      const dirInfo = await FileSystem.getInfoAsync(permanentDir);
      if (!dirInfo.exists) {
        console.log("Creating directory:", permanentDir);
        await FileSystem.makeDirectoryAsync(permanentDir, {
          intermediates: true,
        });
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = sourceUri.split(".").pop() || "jpeg";
      const fileName = `plant_${timestamp}.${fileExtension}`;
      const permanentUri = `${permanentDir}${fileName}`;

      console.log("Copying to:", permanentUri);

      // Copy the file
      await FileSystem.copyAsync({
        from: sourceUri,
        to: permanentUri,
      });

      // Verify the copy was successful
      const copiedInfo = await FileSystem.getInfoAsync(permanentUri);
      if (!copiedInfo.exists) {
        throw new Error("File copy failed - destination file does not exist");
      }

      console.log(
        `Image successfully copied from ${sourceUri} to ${permanentUri}`
      );
      console.log("Copied file size:", copiedInfo.size);

      return permanentUri;
    } catch (error) {
      console.error("Error copying image to permanent location:", error);
      throw error;
    }
  };

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
      const pickedImage = result.assets[0];
      setSelectedImage(pickedImage);

      // Immediately save the image to permanent storage
      setIsSavingImage(true);
      try {
        console.log("=== Saving image immediately after selection ===");
        console.log("Temporary image URI:", pickedImage.uri);

        const permanentUri = await copyImageToPermanentLocation(
          pickedImage.uri
        );
        setPermanentImageUri(permanentUri);
        console.log("Image saved permanently at:", permanentUri);

        // Show a brief success indicator
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Failed to save image immediately:", error);
        Alert.alert(
          "Image Save Warning",
          "Failed to save image to permanent storage. You can still analyze it, but it may not be available later in your logbook.",
          [{ text: "OK" }]
        );
        // Keep the temporary URI as fallback
        setPermanentImageUri(pickedImage.uri);
      } finally {
        setIsSavingImage(false);
      }
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

      // Get file extension from URI or default to jpg
      const uriParts = selectedImage.uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1] || "jpg";

      // Use the original temporary URI for analysis (since it's more likely to exist during analysis)
      formData.append("file", {
        uri: selectedImage.uri,
        type: `image/${fileExtension}`,
        name: `leaf.${fileExtension}`,
      } as any);

      const response = await fetch(
        "https://yasyn14-smartleaf-api.hf.space/predict",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            // Don't set Content-Type for FormData - let the browser set it with boundary
          },
        }
      );

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result: PredictionResponse = await response.json();

      // Validate response structure
      if (
        !result.success ||
        !result.predicted_class ||
        !result.clean_class_name
      ) {
        throw new Error("Invalid response format from server");
      }

      /** avoid navigating if the component unmounted */
      if (mounted.current) {
        router.push({
          pathname: "/diagnosis-result",
          params: {
            // Pass the permanent URI (or fallback to temp URI)
            imageUri: permanentImageUri || selectedImage.uri,
            diagnosis: JSON.stringify(result),
          },
        });
      }
    } catch (error) {
      if (mounted.current) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to analyze image. Please try again.";

        Alert.alert("Analysis Error", errorMessage);
      }
      console.error("Analysis error:", error);
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, [selectedImage, permanentImageUri]);

  /* ───────── UI ───────── */
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.centerContent}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.permissionText}>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.centerContent}>
        <Ionicons name="close" size={48} color="#EF4444" />
        <Text style={styles.permissionText}>Camera access denied</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera permissions in your device settings to take
          photos.
        </Text>
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
                onPress={() => {
                  setSelectedImage(null);
                  setPermanentImageUri(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove selected image"
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>

              {/* Show saving indicator */}
              {isSavingImage && (
                <View style={styles.savingIndicator}>
                  <ActivityIndicator size="small" color="#22C55E" />
                  <Text style={styles.savingText}>Saving...</Text>
                </View>
              )}

              {/* Show success indicator */}
              {permanentImageUri && !isSavingImage && (
                <View style={styles.savedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                  <Text style={styles.savedText}>Saved</Text>
                </View>
              )}
            </View>
          )}

          {/* Picker buttons */}
          <View style={styles.buttonsContainer}>
            <ActionBtn
              icon="camera"
              label="Take Photo"
              onPress={() => launchPicker(true)}
              disabled={isSavingImage}
            />
            <ActionBtn
              icon="image"
              label="Choose from Gallery"
              onPress={() => launchPicker(false)}
              disabled={isSavingImage}
            />
          </View>

          {/* Analyse */}
          {selectedImage && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                (isLoading || isSavingImage) && styles.disabledButton,
              ]}
              onPress={analyzeImage}
              disabled={isLoading || isSavingImage}
              accessibilityRole="button"
              accessibilityLabel="Analyze selected image"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="analytics" size={24} color="white" />
                  <Text style={styles.analyzeButtonText}>
                    {isSavingImage ? "Saving Image..." : "Analyze Image"}
                  </Text>
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
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.actionButton, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
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
    paddingHorizontal: 24,
    gap: 16,
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
  permissionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  permissionSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
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
  savingIndicator: {
    position: "absolute",
    bottom: -30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "500",
  },
  savedIndicator: {
    position: "absolute",
    bottom: -30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "500",
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
