import AsyncStorage from "@react-native-async-storage/async-storage";
export const HAS_ONBOARDED = "@hasOnboarded";

interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string;
  treatment: string;
}

export async function setHasOnboarded() {
  return AsyncStorage.setItem(HAS_ONBOARDED, "true");
}
export async function getHasOnboarded() {
  return AsyncStorage.getItem(HAS_ONBOARDED);
}

export const diseases: Disease[] = [
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
