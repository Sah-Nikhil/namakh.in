export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  quantity: string;
  stats: {
    sodium: number; // mg
    potassium: number; // mg
    magnesium: number; // mg
    dextrose?: number; // g
    // glycine?: number; // mg
    citricAcid?: number; // mg
  };
  features: string[];
  howToUse: string[];
  image: string;
  click: string;
  /** Nutrition and ingredients panel, cut from the pack label artwork. */
  nutritionalLabel?: string;
  /**
   * Declarations as printed on the pack (label artwork, 2026-10-21). Batch,
   * manufacturing and use-by dates are per batch, so they stay on the pack.
   */
  pack: {
    netWeight: string;
    /** Unit price exactly as the label prints it. */
    unitPrice: string;
    servingSize: string;
    ingredients: { name: string; percent: string }[];
    storage: string;
  };
  idealFor: string[];
  /**
   * One pack as it leaves the warehouse, box included. Couriers price on this,
   * and Shiprocket refuses an order without it.
   */
  parcel: {
    weightGrams: number;
    lengthCm: number;
    breadthCm: number;
    heightCm: number;
  };
};

export const products: Product[] = [
  {
    id: "hydration-blend",
    slug: "hydration-blend",
    name: "Hydration Blend",
    tagline: "Everyday balance for energy, clarity, and recovery.",
    description:
      "The Namakh Hydration Blend keeps you energized and clear-headed every day - without sugar or heaviness. Perfect for daily use, light workouts, travel, or hot weather.",
    price: 1450,
    quantity: "/ per pack (50 servings)",
    stats: {
      sodium: 600,
      potassium: 400,
      magnesium: 60,
      dextrose: 0,
    //   glycine: 500,
      citricAcid: 100,
    },
    features: [
      "Zero Sugar",
    //   "Glycine for smooth taste & gut support",
      "Optimal electrolyte balance",
    ],
    howToUse: [
      "Mix 1 scoop (2.77g) of Namakh in 500ml of water, or up to 750ml based on preference.",
      "Can be consumed anytime throughout the day.",
    ],
    click: "/assets/hydra.jpeg",
    image: "/assets/hydration.jpeg",
    nutritionalLabel: "/assets/hydration_nutrition.png",
    pack: {
      netWeight: "138.5 g",
      unitPrice: "₹10.46/g",
      servingSize: "1 scoop (2.77 g), 50 servings per pack",
      ingredients: [
        { name: "Pink Himalayan Salt", percent: "54.98%" },
        { name: "Potassium Chloride", percent: "27.50%" },
        { name: "Magnesium Malate", percent: "13.91%" },
        { name: "Citric Acid", percent: "3.61%" },
      ],
      storage: "Store in a cool, dry place away from direct sunlight.",
    },
    idealFor: ["Daily Hydration", "Light Workouts", "Travel", "Heat"],
    // Weight is the client's figure for the whole filled container (2026-10-20).
    // Box dimensions are still PLACEHOLDERS — replace with measured figures.
    parcel: { weightGrams: 200, lengthCm: 20, breadthCm: 15, heightCm: 5 },
  },



  {
    id: "sports-blend",
    slug: "sports-blend",
    name: "Sports Blend",
    tagline: "High-performance hydration for athletes & heavy sweaters.",
    description:
      "The Namakh Sports Blend fuels your toughest sessions with electrolytes and clean energy. Designed for intense training, long runs, and match days.",
    price: 1150,
    quantity: "/ per pack (30 servings)",
    stats: {
      sodium: 1000,
      potassium: 600,
      magnesium: 100,
      dextrose: 3,
    //   glycine: 500,
      citricAcid: 180,
    },
    features: [
    //   "3g Dextrose for quick energy",
      "Rapid absorption",
      "Higher Sodium for heavy sweaters",
    ],
    howToUse: [
      "Mix 1 scoop (7.51g) of Namakh in 500ml of water, or up to 1000ml based on preference.",
      "Best consumed before, during, or after physical activity.",
    ],
    click: "/assets/sports.jpeg",
    image: "/assets/sport.jpeg",
    nutritionalLabel: "/assets/sports_nutrition.png",
    pack: {
      netWeight: "225.3 g",
      unitPrice: "₹5.104/g",
      servingSize: "1 scoop (7.51 g), 30 servings per pack",
      ingredients: [
        { name: "Dextrose", percent: "39.95%" },
        { name: "Pink Himalayan Salt", percent: "33.85%" },
        { name: "Potassium Chloride", percent: "15.23%" },
        { name: "Magnesium Malate", percent: "8.56%" },
        { name: "Citric Acid", percent: "2.40%" },
      ],
      storage: "Store in a cool, dry place away from direct sunlight.",
    },
    idealFor: ["Intense Training", "Endurance Sports", "Heavy Sweating"],
    // Weight is the client's figure for the whole filled container (2026-10-20).
    // Box dimensions are still PLACEHOLDERS — replace with measured figures.
    parcel: { weightGrams: 287, lengthCm: 20, breadthCm: 15, heightCm: 6 },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
