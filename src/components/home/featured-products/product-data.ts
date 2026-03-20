
import { FeaturedProduct } from './types';

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 1,
    name: "Selta Magic Growth Elixir",
    price: 29.99,
    rating: 4.9,
    reviews: 128,
    image: "/lovable-uploads/hair-oil.avif",
    isNew: true,
    isBestSeller: true
  },
  {
    id: 2,
    name: "Selta Magic Purifying Bar",
    price: 14.99,
    rating: 4.7,
    reviews: 94,
    image: "/lovable-uploads/soap.avif",
    isNew: false,
    isBestSeller: true
  },
  {
    id: 3,
    name: "Selta Magic Premium Unit",
    price: 89.99,
    rating: 4.8,
    reviews: 56,
    image: "/lovable-uploads/hair-wig.avif",
    isNew: true,
    isBestSeller: false
  },
  {
    id: 4,
    name: "Selta Magic Brightening Eye Therapy",
    price: 34.99,
    rating: 4.9,
    reviews: 72,
    image: "/lovable-uploads/eye-cream.avif",
    isNew: true,
    isBestSeller: true
  }
];
