import { useState, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

// Product type that matches our database schema
type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  image: string;
  original_price?: string;
  rating?: string;
  reviews?: number;
  created_at?: string;
  updated_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Products() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch products from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both products and categories
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`)
        ]);
        
        const productsResult = await productsResponse.json();
        const categoriesResult = await categoriesResponse.json();

        if (productsResult.error) throw new Error(productsResult.error);
        if (categoriesResult.error) throw new Error(categoriesResult.error);
        
        setProducts(productsResult.data || []);
        setCategories(categoriesResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Extract unique brands from fetched products
  const brands = Array.from(new Set(
    products
      .map(p => p.brand)
      .filter(brand => brand && brand.trim() !== '')
  )).sort(); // Sort alphabetically
  
  // Apply filters and sorting
  useEffect(() => {
    
    let result = [...products];
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    // Filter by brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand && selectedBrands.includes(p.brand));
    }
    
    // Filter by price range
    if (priceRanges.length > 0) {
      result = result.filter(p => {
        const price = parseFloat(p.price);
        return priceRanges.some(range => {
          if (range === 'under-30') return price < 30;
          if (range === '30-50') return price >= 30 && price <= 50;
          if (range === '50-100') return price > 50 && price <= 100;
          if (range === 'over-100') return price > 100;
          return false;
        });
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      const ratingA = a.rating ? parseFloat(a.rating) : 0;
      const ratingB = b.rating ? parseFloat(b.rating) : 0;
      
      if (sortBy === "price-low") {
        return priceA - priceB;
      }
      if (sortBy === "price-high") {
        return priceB - priceA;
      }
      if (sortBy === "rating") {
        return ratingB - ratingA;
      }
      if (sortBy === "newest") {
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return dateB - dateA;
      }
      // Default: featured - show highest rated first, then newest
      if (ratingA !== ratingB) return ratingB - ratingA;
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA;
    });
    
    setFilteredProducts(result);
  }, [products, selectedCategories, selectedBrands, priceRanges, sortBy]);
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };
  
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };
  
  const handlePriceRangeChange = (range: string, checked: boolean) => {
    if (checked) {
      setPriceRanges([...priceRanges, range]);
    } else {
      setPriceRanges(priceRanges.filter(r => r !== range));
    }
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRanges([]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="pt-24 pb-16 px-4 flex-grow bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-selta-deep-purple mb-2">
                Our Products
              </h1>
              <p className="text-gray-600">
                Discover our premium collection of hair and beauty products
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0 space-x-4">
              <Button 
                variant="outline" 
                className="flex items-center md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className={`md:block ${showFilters ? 'block' : 'hidden'} mb-6 md:mb-0`}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-selta-deep-purple">Filters</h2>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-selta-deep-purple p-0 h-auto"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.id}`} 
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category.name, checked === true)
                          }
                        />
                        <label 
                          htmlFor={`category-${category.id}`} 
                          className="text-sm cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Brands</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`brand-${brand}`} 
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => 
                            handleBrandChange(brand, checked === true)
                          }
                        />
                        <label 
                          htmlFor={`brand-${brand}`} 
                          className="text-sm cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-1" 
                        checked={priceRanges.includes('under-30')}
                        onCheckedChange={(checked) => 
                          handlePriceRangeChange('under-30', checked === true)
                        }
                      />
                      <label htmlFor="price-1" className="text-sm cursor-pointer">Under $30</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-2" 
                        checked={priceRanges.includes('30-50')}
                        onCheckedChange={(checked) => 
                          handlePriceRangeChange('30-50', checked === true)
                        }
                      />
                      <label htmlFor="price-2" className="text-sm cursor-pointer">$30 - $50</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-3" 
                        checked={priceRanges.includes('50-100')}
                        onCheckedChange={(checked) => 
                          handlePriceRangeChange('50-100', checked === true)
                        }
                      />
                      <label htmlFor="price-3" className="text-sm cursor-pointer">$50 - $100</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="price-4" 
                        checked={priceRanges.includes('over-100')}
                        onCheckedChange={(checked) => 
                          handlePriceRangeChange('over-100', checked === true)
                        }
                      />
                      <label htmlFor="price-4" className="text-sm cursor-pointer">Over $100</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-selta-deep-purple mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-selta-deep-purple mb-2">
                    Loading products...
                  </h3>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="text-xl font-semibold text-selta-deep-purple mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    {products.length === 0 ? 
                      "No products available in the database." : 
                      "Try clearing some filters or checking back later."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
