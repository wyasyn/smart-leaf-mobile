import AsyncStorage from "@react-native-async-storage/async-storage";
export const HAS_ONBOARDED = "@hasOnboarded";

export async function setHasOnboarded() {
  return AsyncStorage.setItem(HAS_ONBOARDED, "true");
}
export async function getHasOnboarded() {
  return AsyncStorage.getItem(HAS_ONBOARDED);
}

// Consistent storage key
export const STORAGE_KEYS = {
  PLANT_LOGS: "plantLogs", // Use the same key everywhere
} as const;

// Unified data structure
export interface PlantLog {
  id: string;
  date: string; // ISO string
  image: string;
  disease: string;
  confidence: number;
  treatment?: string;
  description?: string;
  symptoms?: string;
  result: string; // Keep for backward compatibility
}

// Event system for real-time updates
type StorageEventCallback = () => void;
const storageEventListeners: StorageEventCallback[] = [];

export const addStorageListener = (callback: StorageEventCallback) => {
  storageEventListeners.push(callback);

  // Return cleanup function
  return () => {
    const index = storageEventListeners.indexOf(callback);
    if (index > -1) {
      storageEventListeners.splice(index, 1);
    }
  };
};

const notifyStorageListeners = () => {
  storageEventListeners.forEach((callback) => callback());
};

// Storage operations
export const getPlantLogs = async (): Promise<PlantLog[]> => {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.PLANT_LOGS);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Error loading plant logs:", error);
    return [];
  }
};

export const savePlantLog = async (log: PlantLog): Promise<void> => {
  try {
    const existingLogs = await getPlantLogs();
    const updatedLogs = [log, ...existingLogs]; // Add new log at the beginning
    await AsyncStorage.setItem(
      STORAGE_KEYS.PLANT_LOGS,
      JSON.stringify(updatedLogs)
    );
    notifyStorageListeners();
  } catch (error) {
    console.error("Error saving plant log:", error);
    throw error;
  }
};

export const clearPlantLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PLANT_LOGS);
    notifyStorageListeners();
  } catch (error) {
    console.error("Error clearing plant logs:", error);
    throw error;
  }
};

// Statistics helpers
export const getPlantLogStats = async () => {
  try {
    const logs = await getPlantLogs();
    const totalScans = logs.length;

    const todayStr = new Date().toDateString();
    const todayScans = logs.filter(
      (log) => new Date(log.date).toDateString() === todayStr
    ).length;

    return { totalScans, todayScans };
  } catch (error) {
    console.error("Error getting plant log stats:", error);
    return { totalScans: 0, todayScans: 0 };
  }
};

// Enhanced Disease Data Structure
export interface Disease {
  id: number;
  name: string;
  scientificName?: string;
  description: string;
  category:
    | "Fungal"
    | "Bacterial"
    | "Viral"
    | "Nutritional"
    | "Environmental"
    | "Pest-Related";
  severity: "Low" | "Medium" | "High";
  affectedCrops: string[];
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  seasonality?: string;
  climateConditions?: string[];
  images?: string[];
  commonNames?: string[];
}

export const diseases: Disease[] = [
  {
    id: 1,
    name: "Apple Scab",
    scientificName: "Venturia inaequalis",
    description:
      "A fungal disease that affects apple trees, causing dark spots on leaves and fruit, leading to reduced fruit quality and tree health.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Apple", "Pear", "Crabapple"],
    symptoms: [
      "Dark, olive-green to black spots on leaves",
      "Fruit cracking and scabbing",
      "Premature leaf drop",
      "Reduced fruit quality",
      "Stunted fruit growth",
    ],
    causes: [
      "Wet, humid conditions",
      "Poor air circulation",
      "Infected plant debris",
      "Spore dispersal through wind and rain",
    ],
    treatment: [
      "Apply fungicide sprays (myclobutanil, captan)",
      "Remove infected leaves and fruit",
      "Prune to improve air circulation",
      "Apply dormant oil sprays in late winter",
    ],
    prevention: [
      "Choose resistant apple varieties",
      "Maintain proper tree spacing",
      "Clean up fallen leaves in autumn",
      "Ensure good drainage",
    ],
    seasonality: "Spring to early summer",
    climateConditions: [
      "High humidity",
      "Cool temperatures",
      "Frequent rainfall",
    ],
    commonNames: ["Black spot", "Apple black spot"],
  },
  {
    id: 2,
    name: "Tomato Late Blight",
    scientificName: "Phytophthora infestans",
    description:
      "A destructive water mold disease affecting tomato and potato plants, capable of destroying entire crops within days under favorable conditions.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
    symptoms: [
      "Brown to black spots on leaves with white fuzzy growth underneath",
      "Rapid yellowing and browning of foliage",
      "Dark, sunken spots on fruit",
      "White mold growth in humid conditions",
      "Stem lesions and plant collapse",
    ],
    causes: [
      "Cool, wet weather conditions",
      "High humidity (>90%)",
      "Poor air circulation",
      "Infected seed or transplants",
    ],
    treatment: [
      "Apply copper-based fungicides immediately",
      "Remove and destroy infected plants",
      "Improve air circulation",
      "Apply protective fungicides preventively",
    ],
    prevention: [
      "Choose resistant varieties",
      "Avoid overhead watering",
      "Ensure proper plant spacing",
      "Use drip irrigation",
      "Rotate crops annually",
    ],
    seasonality: "Late summer to early fall",
    climateConditions: [
      "Cool temperatures (60-70°F)",
      "High humidity",
      "Wet conditions",
    ],
    commonNames: ["Potato blight", "Irish potato famine disease"],
  },
  {
    id: 3,
    name: "Corn Rust",
    scientificName: "Puccinia sorghi",
    description:
      "A fungal disease creating distinctive rust-colored pustules on corn leaves, reducing photosynthetic capacity and yield potential.",
    category: "Fungal",
    severity: "Medium",
    affectedCrops: ["Corn", "Sweet corn", "Popcorn"],
    symptoms: [
      "Orange-brown pustules on leaf surfaces",
      "Yellowing of infected leaves",
      "Reduced photosynthesis",
      "Premature senescence",
      "Potential yield reduction",
    ],
    causes: [
      "Humid, warm weather",
      "Wind dispersal of spores",
      "Dense plant populations",
      "Alternate host plants nearby",
    ],
    treatment: [
      "Apply fungicides if economically justified",
      "Remove alternate host plants",
      "Monitor and scout regularly",
      "Harvest early if severely infected",
    ],
    prevention: [
      "Plant resistant corn varieties",
      "Ensure proper plant spacing",
      "Remove crop debris after harvest",
      "Rotate with non-host crops",
    ],
    seasonality: "Mid to late summer",
    climateConditions: [
      "Warm temperatures",
      "High humidity",
      "Moderate rainfall",
    ],
    commonNames: ["Common rust", "Orange rust"],
  },
  {
    id: 4,
    name: "Potato Early Blight",
    scientificName: "Alternaria solani",
    description:
      "A common fungal disease causing characteristic target-spot lesions on potato foliage, leading to defoliation and reduced tuber quality.",
    category: "Fungal",
    severity: "Medium",
    affectedCrops: ["Potato", "Tomato", "Eggplant"],
    symptoms: [
      "Dark brown spots with concentric rings (target spots)",
      "Yellowing of older leaves first",
      "Progressive defoliation from bottom up",
      "Stem lesions and girdling",
      "Tuber infections with dark, sunken spots",
    ],
    causes: [
      "Warm, humid conditions",
      "Plant stress from drought or nutrient deficiency",
      "Mechanical injuries",
      "Poor air circulation",
    ],
    treatment: [
      "Apply preventive fungicides (chlorothalonil, mancozeb)",
      "Remove infected plant debris",
      "Ensure adequate nutrition",
      "Maintain consistent soil moisture",
    ],
    prevention: [
      "Rotate crops (3-4 year rotation)",
      "Choose resistant varieties",
      "Ensure proper plant spacing",
      "Maintain plant vigor with balanced nutrition",
      "Avoid overhead irrigation",
    ],
    seasonality: "Throughout growing season",
    climateConditions: [
      "Warm temperatures (75-85°F)",
      "High humidity",
      "Alternating wet-dry periods",
    ],
    commonNames: ["Target spot", "Collar rot"],
  },
  {
    id: 5,
    name: "Grape Powdery Mildew",
    scientificName: "Erysiphe necator",
    description:
      "A fungal disease creating distinctive white powdery coating on grape foliage and fruit, significantly impacting wine quality and yield.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Grape", "Wine grapes", "Table grapes"],
    symptoms: [
      "White powdery growth on leaves and shoots",
      "Fruit cracking and splitting",
      "Stunted shoot growth",
      "Poor fruit set",
      "Off-flavors in wine grapes",
    ],
    causes: [
      "Moderate temperatures (68-77°F)",
      "High humidity without free moisture",
      "Poor air circulation",
      "Dense canopy growth",
    ],
    treatment: [
      "Apply sulfur-based fungicides",
      "Use systemic fungicides for severe infections",
      "Prune for better air circulation",
      "Remove infected shoots and clusters",
    ],
    prevention: [
      "Choose resistant grape varieties",
      "Maintain open canopy through pruning",
      "Ensure proper vine spacing",
      "Monitor weather conditions",
      "Apply preventive sulfur sprays",
    ],
    seasonality: "Spring through harvest",
    climateConditions: [
      "Moderate temperatures",
      "High humidity",
      "Limited rainfall",
    ],
    commonNames: ["White mold", "Oidium"],
  },
  // Additional diseases for broader coverage
  {
    id: 6,
    name: "Citrus Canker",
    scientificName: "Xanthomonas citri",
    description:
      "A bacterial disease affecting citrus trees, causing characteristic raised lesions on leaves, fruit, and stems.",
    category: "Bacterial",
    severity: "High",
    affectedCrops: ["Orange", "Lemon", "Lime", "Grapefruit", "Citrus"],
    symptoms: [
      "Raised, corky lesions with yellow halos",
      "Premature fruit drop",
      "Defoliation in severe cases",
      "Fruit scarring and blemishes",
      "Twig dieback",
    ],
    causes: [
      "Warm, humid conditions",
      "Wind-driven rain",
      "Mechanical wounds",
      "Contaminated pruning tools",
    ],
    treatment: [
      "Apply copper-based bactericides",
      "Remove and destroy infected plant parts",
      "Disinfect pruning tools",
      "Improve air circulation",
    ],
    prevention: [
      "Use pathogen-free planting material",
      "Avoid overhead irrigation",
      "Maintain windbreaks",
      "Regular sanitation practices",
    ],
    seasonality: "Year-round in warm climates",
    climateConditions: [
      "Warm temperatures",
      "High humidity",
      "Frequent rainfall",
    ],
    commonNames: ["Citrus bacterial canker"],
  },
  {
    id: 7,
    name: "Wheat Stripe Rust",
    scientificName: "Puccinia striiformis",
    description:
      "A serious fungal disease of wheat characterized by yellow stripes on leaves, capable of causing significant yield losses.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Wheat", "Barley", "Rye"],
    symptoms: [
      "Yellow-orange stripes parallel to leaf veins",
      "Premature leaf senescence",
      "Reduced grain filling",
      "Weakened stems prone to lodging",
      "Shriveled grains",
    ],
    causes: [
      "Cool, moist conditions",
      "Wind dispersal of spores",
      "Susceptible wheat varieties",
      "Favorable weather patterns",
    ],
    treatment: [
      "Apply triazole fungicides",
      "Time applications based on growth stage",
      "Monitor disease progression",
      "Consider economic thresholds",
    ],
    prevention: [
      "Plant resistant wheat varieties",
      "Diversify wheat varieties in region",
      "Monitor weather conditions",
      "Scout fields regularly",
    ],
    seasonality: "Cool spring conditions",
    climateConditions: [
      "Cool temperatures (50-65°F)",
      "High humidity",
      "Dewy mornings",
    ],
    commonNames: ["Yellow rust", "Stripe rust"],
  },
  {
    id: 8,
    name: "Rice Blast",
    scientificName: "Magnaporthe oryzae",
    description:
      "One of the most serious diseases of rice worldwide, causing lesions on leaves, nodes, and panicles.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Rice", "Wild rice"],
    symptoms: [
      "Diamond-shaped lesions with gray centers",
      "Brown borders around lesions",
      "Node infections causing stem breakage",
      "Panicle blast affecting grain fill",
      "Seedling blight in nurseries",
    ],
    causes: [
      "High humidity and moisture",
      "Excessive nitrogen fertilization",
      "Dense planting",
      "Susceptible varieties",
    ],
    treatment: [
      "Apply systemic fungicides",
      "Reduce nitrogen fertilization",
      "Improve field drainage",
      "Remove infected plant debris",
    ],
    prevention: [
      "Use resistant rice varieties",
      "Balanced fertilization",
      "Proper water management",
      "Seed treatment before planting",
    ],
    seasonality: "Throughout rice growing season",
    climateConditions: [
      "High humidity",
      "Warm temperatures",
      "Free moisture on leaves",
    ],
    commonNames: ["Rice brown spot", "Seedling blight"],
  },
  {
    id: 9,
    name: "Coffee Leaf Rust",
    scientificName: "Hemileia vastatrix",
    description:
      "A devastating fungal disease of coffee plants, causing premature defoliation and significant yield losses.",
    category: "Fungal",
    severity: "High",
    affectedCrops: ["Coffee", "Arabica coffee", "Robusta coffee"],
    symptoms: [
      "Yellow-orange powdery spots on leaf undersides",
      "Premature leaf drop",
      "Reduced photosynthesis",
      "Dieback of branches",
      "Reduced bean quality and quantity",
    ],
    causes: [
      "High humidity and rainfall",
      "Moderate temperatures (68-75°F)",
      "Poor air circulation",
      "Shade conditions",
    ],
    treatment: [
      "Apply copper-based fungicides",
      "Improve plantation management",
      "Prune for better air circulation",
      "Remove infected leaves",
    ],
    prevention: [
      "Plant resistant coffee varieties",
      "Maintain proper spacing",
      "Balanced nutrition program",
      "Monitor weather conditions",
    ],
    seasonality: "Rainy season",
    climateConditions: [
      "High humidity",
      "Moderate temperatures",
      "Frequent rainfall",
    ],
    commonNames: ["Coffee rust", "Orange rust disease"],
  },
  {
    id: 10,
    name: "Iron Deficiency Chlorosis",
    scientificName: "Nutritional disorder",
    description:
      "A nutritional disorder causing yellowing of leaves while veins remain green, common in alkaline soils.",
    category: "Nutritional",
    severity: "Medium",
    affectedCrops: ["Soybean", "Corn", "Fruit trees", "Ornamentals"],
    symptoms: [
      "Interveinal chlorosis (yellow leaves, green veins)",
      "Stunted growth",
      "Reduced vigor",
      "Poor fruit set",
      "Leaf bronzing in severe cases",
    ],
    causes: [
      "High soil pH (alkaline conditions)",
      "Poor iron availability",
      "Waterlogged soils",
      "High bicarbonate levels",
      "Root damage",
    ],
    treatment: [
      "Apply iron chelates to soil or foliage",
      "Soil acidification with sulfur",
      "Improve soil drainage",
      "Foliar iron sprays for quick response",
    ],
    prevention: [
      "Soil pH management",
      "Choose iron-efficient varieties",
      "Improve soil organic matter",
      "Ensure proper drainage",
      "Regular soil testing",
    ],
    seasonality: "Early growing season",
    climateConditions: ["Cool, wet soils", "Alkaline soil conditions"],
    commonNames: ["Iron chlorosis", "Lime-induced chlorosis"],
  },
];
