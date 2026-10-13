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
  nutritionalLabel: string;
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
    image: "/assets/hydration_pack.png",
    nutritionalLabel: "/assets/hydration_nut.png",
    idealFor: ["Daily Hydration", "Light Workouts", "Travel", "Heat"],
    // PLACEHOLDER — estimated from 50 × 2.77g of powder plus pouch and box.
    // Replace with the client's measured, packed figures before launch.
    parcel: { weightGrams: 250, lengthCm: 20, breadthCm: 15, heightCm: 5 },
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
    image: "/assets/sports_pack.png",
    nutritionalLabel: "/assets/sports_nut.png",
    idealFor: ["Intense Training", "Endurance Sports", "Heavy Sweating"],
    // PLACEHOLDER — estimated from 30 × 7.51g of powder plus pouch and box.
    // Replace with the client's measured, packed figures before launch.
    parcel: { weightGrams: 350, lengthCm: 20, breadthCm: 15, heightCm: 6 },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
