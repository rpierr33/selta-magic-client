
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import ProductCard from "./featured-products/ProductCard";
import SectionHeader from "./featured-products/SectionHeader";
import MobileViewAllButton from "./featured-products/MobileViewAllButton";
import { featuredProducts } from "./featured-products/product-data";
import { containerVariants, itemVariants } from "./featured-products/animations";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function FeaturedProducts() {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState(featuredProducts);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredProducts(featuredProducts);
      return;
    }

    const filtered = featuredProducts.filter(product => {
      if (activeFilters.includes('new') && product.isNew) return true;
      if (activeFilters.includes('bestseller') && product.isBestSeller) return true;
      return false;
    });

    setFilteredProducts(filtered.length > 0 ? filtered : featuredProducts);
  }, [activeFilters]);

  const handleViewAllProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/products');
  };

  const handleFilterChange = (value: string[]) => {
    setActiveFilters(value);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader onViewAllClick={handleViewAllProducts} />
        
        <div className="flex justify-center mb-8">
          <div className="bg-gray-50 p-1 rounded-full inline-flex items-center border">
            <Filter className="h-4 w-4 text-gray-500 mr-2 ml-3" />
            <ToggleGroup 
              type="multiple" 
              value={activeFilters}
              onValueChange={handleFilterChange}
              className="flex space-x-1"
            >
              <ToggleGroupItem 
                value="new" 
                className="text-sm rounded-full px-4 py-1 data-[state=on]:bg-selta-gold data-[state=on]:text-selta-deep-purple"
              >
                New
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="bestseller" 
                className="text-sm rounded-full px-4 py-1 data-[state=on]:bg-selta-deep-purple data-[state=on]:text-white"
              >
                Best Seller
              </ToggleGroupItem>
              {activeFilters.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-500"
                  onClick={() => setActiveFilters([])}
                >
                  Clear
                </Button>
              )}
            </ToggleGroup>
          </div>
        </div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variants={itemVariants}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-16">
              <p className="text-gray-500">No products match your filter criteria.</p>
              <Button 
                variant="link" 
                onClick={() => setActiveFilters([])}
                className="mt-2 text-selta-deep-purple"
              >
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>
        
        <MobileViewAllButton onViewAllClick={handleViewAllProducts} />
      </div>
    </section>
  );
}
