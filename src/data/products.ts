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
    name: "Selta Magic Hair Oil",
    price: 29.99,
    original_price: 39.99,
    description: "Strengthen and nourish your hair with our premium Selta Magic Hair Oil. Formulated with natural oils and essential vitamins, this powerful blend penetrates deeply to fortify hair from root to tip, promoting healthy growth and a lustrous shine. Recommended for all hair types.",
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
    name: "Selta Magic Soap",
    price: 14.99,
    description: "Cleanse and moisturize with our gentle yet effective Selta Magic Soap. Specially crafted for all skin types, this nourishing soap combines natural ingredients to leave your skin feeling soft, hydrated, and refreshed after every use. Perfect for daily skincare.",
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
    name: "Luxurious Hair Wig",
    price: 89.99,
    original_price: 119.99,
    description: "Transform your look with our premium quality Luxurious Hair Wig. Designed to suit all hair types, this beautifully crafted wig offers a natural appearance and comfortable fit, giving you the confidence to express your unique style effortlessly.",
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
    name: "Selta Magic Eye Cream",
    price: 34.99,
    original_price: 44.99,
    description: "Revitalize and brighten the delicate skin around your eyes with our Selta Magic Eye Cream. This advanced formula targets dark circles, puffiness, and fine lines with a blend of nourishing botanicals and peptides for a youthful, refreshed appearance.",
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
