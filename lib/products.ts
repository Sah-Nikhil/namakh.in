export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  stats: {
    sodium: number; // mg
    potassium: number; // mg
    magnesium: number; // mg
    sugar: number; // g
    dextrose?: number; // g
  };
  features: string[];
  image: string;
  nutritionalLabel: string;
  idealFor: string[];
};

export const products: Product[] = [
  {
    id: "hydration-blend",
    slug: "hydration-blend",
    name: "Hydration Blend",
    tagline: "Everyday balance for energy, clarity, and recovery.",
    description:
      "The Namakh Hydration Blend keeps you energized and clear-headed every day — without sugar or heaviness. Perfect for daily use, light workouts, travel, or hot weather.",
    price: 999,
    stats: {
      sodium: 600,
      potassium: 400,
      magnesium: 60,
      sugar: 0,
    },
    features: [
      "Zero Sugar",
      "Glycine for smooth taste & gut support",
      "Optimal electrolyte balance",
    ],
    image: "/assets/hydration_pack.png",
    nutritionalLabel: "/assets/hydration_nut.png",
    idealFor: ["Daily Hydration", "Light Workouts", "Travel", "Heat"],
  },
  {
    id: "sports-blend",
    slug: "sports-blend",
    name: "Sports Blend",
    tagline: "High-performance hydration for athletes & heavy sweaters.",
    description:
      "The Namakh Sports Blend fuels your toughest sessions with electrolytes and clean energy. Designed for intense training, long runs, and match days.",
    price: 1199,
    stats: {
      sodium: 1000,
      potassium: 600,
      magnesium: 100,
      sugar: 3,
      dextrose: 3,
    },
    features: [
      "3g Dextrose for quick energy",
      "Higher Sodium for heavy sweaters",
      "Rapid absorption",
    ],
    image: "/assets/sports_pack.png",
    nutritionalLabel: "/assets/sports_nut.png",
    idealFor: ["Intense Training", "Endurance Sports", "Heavy Sweating"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
