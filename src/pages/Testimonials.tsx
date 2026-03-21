import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Users, TrendingUp, Plus } from 'lucide-react';
import TestimonialCard from '@/components/testimonials/TestimonialCard';
import TestimonialForm from '@/components/testimonials/TestimonialForm';
import { useTestimonials } from '@/hooks/useTestimonials';
import { testimonialService } from '@/services/testimonialService';
import { products } from '@/data/products';
import { useAuth } from '@/hooks/useAuth';

export default function Testimonials() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);

  console.log('Testimonials component rendering...');

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    productId: selectedProduct || undefined,
    rating: selectedRating,
    sortBy,
  }), [selectedProduct, selectedRating, sortBy]);

  const { testimonials, loading, error, addTestimonial, refresh } = useTestimonials(filters);

  console.log('Testimonials data:', testimonials);
  console.log('Loading state:', loading);

  // Get stats synchronously from localStorage service (always available)
  const stats = testimonialService.getTestimonialStats();
  console.log('Stats:', stats);

  const { user } = useAuth();

  const handleFormSuccess = () => {
    setShowForm(false);
    refresh();
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      // Redirect to login page with a return URL
      navigate(`/login?redirect=${encodeURIComponent('/testimonials')}`);
      return;
    }
    setShowForm(true);
  };

  if (loading) {
    console.log('Showing loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  // Add error handling
  if (error) {
    console.log('Error state detected:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading testimonials: {error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Testimonials</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover what our customers are saying about their experience with Selta products
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-sm opacity-90">Happy Customers</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-90">Total Reviews</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold">
                  {stats.ratingCounts[5] || 0}
                </div>
                <div className="text-sm opacity-90">5-Star Reviews</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="reviews" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="reviews">View Reviews</TabsTrigger>
              <TabsTrigger 
                value="write" 
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate(`/login?redirect=${encodeURIComponent('/testimonials')}`);
                  }
                }}
              >
                {user ? 'Write a Review' : 'Login to Review'}
              </TabsTrigger>
            </TabsList>

            <Button 
              onClick={handleWriteReviewClick}
              className="bg-purple-900 hover:bg-purple-800 md:hidden"
            >
              <Plus className="h-4 w-4 mr-2" />
              {user ? 'Write Review' : 'Login to Review'}
            </Button>
          </div>

          <TabsContent value="reviews" className="space-y-8">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Reviews</CardTitle>
                <CardDescription>
                  Find reviews that match your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Product</label>
                    <Select value={selectedProduct || "all"} onValueChange={(value) => setSelectedProduct(value === "all" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <Select 
                      value={selectedRating?.toString() || 'all'} 
                      onValueChange={(value) => setSelectedRating(value === 'all' ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="rating_high">Highest Rating</SelectItem>
                        <SelectItem value="rating_low">Lowest Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedProduct('');
                        setSelectedRating(undefined);
                        setSortBy('newest');
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Grid */}
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedProduct || selectedRating 
                      ? "No reviews match your current filters. Try adjusting your search criteria."
                      : "Be the first to share your experience with our products!"
                    }
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-purple-900 hover:bg-purple-800"
                  >
                    Write the First Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="write">
            <TestimonialForm onSuccess={handleFormSuccess} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Write a Review</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <TestimonialForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
