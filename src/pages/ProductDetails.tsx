
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, ArrowLeft, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { resolveImageUrl, createImageErrorHandler } from "@/utils/imageUtils";
import ProductTestimonials from "@/components/testimonials/ProductTestimonials";

// Product type that matches our database schema
type Product = {
  id: string;
  name: string;
  description: string;
  price: string; // PostgreSQL DECIMAL comes as string
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

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        setProduct(result.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to fetch product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // Enhanced error handling for missing products
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-selta-deep-purple mb-4">Invalid Product URL</h1>
            <p className="text-gray-600 mb-6">
              The product URL is invalid or incomplete. Please check the link and try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/products">
                <Button className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Browse Products
                </Button>
              </Link>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-selta-deep-purple mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-selta-deep-purple mb-2">
              Loading product details...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-selta-deep-purple mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or may have been removed. This could happen if:
            </p>
            <ul className="text-left text-gray-600 mb-6 space-y-1">
              <li>• The product has been discontinued</li>
              <li>• The product ID is incorrect</li>
              <li>• The product is temporarily unavailable</li>
            </ul>
            <div className="flex gap-3 justify-center">
              <Link to="/products">
                <Button className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Browse All Products
                </Button>
              </Link>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleAddToCart = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBuyNow = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await addToCart(product, quantity);
      navigate("/cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="pt-24 pb-16 px-4 flex-grow bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost" 
              className="text-selta-deep-purple"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={resolveImageUrl(product.image)}
                  alt={product.name} 
                  className="w-full max-w-md object-contain"
                  onError={createImageErrorHandler()}
                />
              </div>
              
              {/* Product Details */}
              <div>
                <h1 className="text-3xl font-bold text-selta-deep-purple mb-2">{product.name}</h1>
                
                {product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.floor(parseFloat(product.rating!)) ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-700 ml-2">
                      {parseFloat(product.rating).toFixed(1)} ({product.reviews || 0} reviews)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center mb-6">
                  <span className="text-2xl font-bold text-selta-gold">${parseFloat(product.price).toFixed(2)}</span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                    <span className="ml-3 text-gray-500 line-through">
                      ${parseFloat(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">{product.description}</p>
                
                <div className="flex items-center mb-6">
                  <div className="flex items-center border border-gray-300 rounded-md mr-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-green-600">
                      <Check className="h-4 w-4 inline mr-1" />
                      In Stock
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button 
                    className="flex-1 bg-selta-deep-purple hover:bg-selta-deep-purple/90 text-white"
                    onClick={handleAddToCart}
                    disabled={isLoading}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button 
                    className="flex-1 bg-selta-gold text-selta-deep-purple hover:bg-selta-gold/90 font-semibold"
                    onClick={handleBuyNow}
                    disabled={isLoading}
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="aspect-square border-selta-deep-purple text-selta-deep-purple hover:bg-selta-deep-purple/10"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Category:</span> {product.category}
                  </p>
                  <p>
                    <span className="font-medium">Brand:</span> {product.brand}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <Tabs defaultValue="description">
              <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
                <TabsTrigger value="testimonials">Product Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="text-gray-700">
                <p className="mb-4">{product.description}</p>
                <p>
                  Our products are made with premium ingredients and are free from harmful chemicals.
                  We believe in providing high-quality hair care solutions that are effective
                  and safe for regular use.
                </p>
              </TabsContent>
              
              <TabsContent value="specifications">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-selta-deep-purple mb-2">Contents</h3>
                      <p className="text-gray-700 text-sm">100% natural extracts and premium ingredients</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-selta-deep-purple mb-2">Volume</h3>
                      <p className="text-gray-700 text-sm">8.4 fl oz (250ml)</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-selta-deep-purple mb-2">Directions</h3>
                      <p className="text-gray-700 text-sm">Apply to clean, damp hair. Leave for 5 minutes and rinse thoroughly.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-selta-deep-purple mb-2">Suitable For</h3>
                      <p className="text-gray-700 text-sm">All hair types, including color-treated hair</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-selta-deep-purple mb-2">Ingredients</h3>
                    <p className="text-gray-700 text-sm">
                      Aqua, Aloe Barbadensis Leaf Juice, Cetearyl Alcohol, Behentrimonium Methosulfate, 
                      Glycerin, Cocos Nucifera (Coconut) Oil, Argania Spinosa Kernel Oil, Butyrospermum Parkii (Shea) Butter, 
                      Panthenol, Hydrolyzed Keratin, Biotin, Tocopheryl Acetate, Citrus Aurantium Dulcis (Orange) Peel Oil, 
                      Lavandula Angustifolia (Lavender) Oil, Phenoxyethanol, Ethylhexylglycerin, Citric Acid
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-2">Customer Reviews</h3>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={20} className={i < Math.floor(parseFloat(product.rating || '0')) ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-700">
                        Based on {product.reviews} reviews
                      </span>
                    </div>
                    
                    <Button className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                      Write a Review
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {/* Sample Reviews */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-3">Sarah J.</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < 5 ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">1 month ago</span>
                      </div>
                      <p className="text-gray-700">
                        This product exceeded my expectations! After just two weeks of use, I noticed significant improvement in my hair's health and growth. The scent is also amazing - not too strong but very pleasant.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-3">Michael T.</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < 4 ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">2 months ago</span>
                      </div>
                      <p className="text-gray-700">
                        I've tried many hair products over the years, and this one definitely ranks among the best. It doesn't leave any residue and my hair feels much stronger. The only drawback is that it's a bit pricey, but the quality justifies the cost.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="font-medium mr-3">Lisa R.</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < 5 ? "text-selta-gold fill-selta-gold" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">3 months ago</span>
                      </div>
                      <p className="text-gray-700">
                        As someone with very damaged hair from years of color treatments, I was skeptical about yet another hair product claiming to repair. But this actually works! My hair is noticeably softer and breaks much less. Will definitely repurchase!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="testimonials">
                <ProductTestimonials 
                  productId={product.id} 
                  productName={product.name}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
