export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  image: string;
  category: string;
  brand: string;
  stock_quantity: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

// Product data matching actual Selta Magic product line
export const products: Product[] = [
  {
    id: "1",
    name: "Selta Magic Growth Elixir",
    price: 29.99,
    original_price: 39.99,
    description: "A clinically-inspired blend of nutrient-rich botanical oils designed to restore strength, stimulate growth, and deeply nourish the scalp. Selta Magic Growth Elixir penetrates beyond the surface to support healthier, fuller hair — without synthetic fillers or harsh chemicals. Lightweight yet potent, this formula is ideal for protective styles, natural hair, and chemically treated hair alike. Target the scalp. Transform the hair.",
    image: "/lovable-uploads/hair-oil.avif",
    category: "Hair Care",
    brand: "Selta",
    stock_quantity: 150,
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestSeller: true
  },
  {
    id: "2",
    name: "Selta Magic Purifying Bar",
    price: 14.99,
    description: "A gentle yet effective cleansing bar formulated to purify, balance, and restore the skin without stripping its natural moisture barrier. Infused with plant-based ingredients known for their clarifying and soothing properties, this bar is ideal for daily use on face and body. Designed for melanin-rich skin, it helps promote an even, radiant complexion. Clean skin. Clear confidence.",
    image: "/lovable-uploads/soap.avif",
    category: "Skin Care",
    brand: "Selta",
    stock_quantity: 200,
    rating: 4.7,
    reviews: 94,
    isNew: false,
    isBestSeller: true
  },
  {
    id: "3",
    name: "Selta Magic Premium Unit",
    price: 89.99,
    original_price: 119.99,
    description: "Crafted for effortless beauty and confidence, the Selta Magic Premium Unit delivers a natural, flawless look with minimal effort. Designed to blend seamlessly and elevate your everyday style, this unit offers versatility, comfort, and durability. Whether worn daily or occasionally, it's beauty — simplified. Luxury hair. Zero compromise.",
    image: "/lovable-uploads/hair-wig.avif",
    category: "Hair Accessories",
    brand: "Selta",
    stock_quantity: 120,
    rating: 4.8,
    reviews: 56,
    isNew: true,
    isBestSeller: false
  },
  {
    id: "4",
    name: "Selta Magic Brightening Eye Therapy",
    price: 34.99,
    original_price: 44.99,
    description: "A targeted treatment formulated to visibly reduce dark circles, puffiness, and signs of fatigue. This lightweight, fast-absorbing cream delivers hydration and revitalization to the delicate under-eye area. Engineered with a clean, clinical approach to help you look rested — even when you're not. Look awake. Stay powerful.",
    image: "/lovable-uploads/eye-cream.avif",
    category: "Skin Care",
    brand: "Selta",
    stock_quantity: 100,
    rating: 4.9,
    reviews: 72,
    isNew: true,
    isBestSeller: true
  },
];

// Helper functions for product data
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
};

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm)
  );
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isBestSeller || product.isNew).slice(0, 4);
};

export const getNewProducts = (): Product[] => {
  return products.filter(product => product.isNew);
};

export const getBestSellerProducts = (): Product[] => {
  return products.filter(product => product.isBestSeller);
};
