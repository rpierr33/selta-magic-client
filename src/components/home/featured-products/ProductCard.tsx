
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { FeaturedProduct } from "./types";
import { resolveImageUrl, createImageErrorHandler } from "@/utils/imageUtils";

interface ProductCardProps {
  product: FeaturedProduct;
  variants: any;
}

export default function ProductCard({ product, variants }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      variants={variants}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
        {(product.isNew || product.isBestSeller) && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-selta-gold text-selta-deep-purple border-0 font-semibold">New</Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-selta-deep-purple text-white border-0">Bestseller</Badge>
            )}
          </div>
        )}

        <div
          onClick={handleProductClick}
          className="aspect-square overflow-hidden block cursor-pointer"
        >
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={createImageErrorHandler()}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-xs text-gray-700 ml-2 font-medium">({product.reviews})</span>
          </div>

          <div
            onClick={handleProductClick}
            className="block cursor-pointer"
          >
            <h3 className="font-display text-lg font-semibold text-selta-deep-purple mb-1 line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-selta-gold font-bold mb-4">
            ${product.price}
          </p>

          <div className="flex space-x-2">
            <Button
              className="bg-selta-deep-purple hover:bg-selta-deep-purple/90 text-white flex-1 rounded-full font-medium"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-selta-deep-purple text-selta-deep-purple hover:bg-selta-deep-purple/10"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
