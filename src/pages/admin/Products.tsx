import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { localClient } from '@/lib/localClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Edit, Trash2, ImageIcon } from 'lucide-react';
import { uploadImageToLocal, validateImageFile } from '@/api/imageUpload';
import { resolveImageUrl, createImageErrorHandler } from '@/utils/imageUtils';

// Product type
type Product = {
  id: string;
  name: string;
  description: string;
  price: string; // PostgreSQL DECIMAL comes as string
  category: string;
  brand: string;
  image: string;
  original_price?: string; // PostgreSQL DECIMAL comes as string
  rating?: string; // PostgreSQL DECIMAL comes as string
  reviews?: number;
  created_at?: string;
  updated_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminProducts() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    original_price: '',
    rating: '',
    reviews: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await fetch(`${API_BASE_URL}/categories`);
      const result = await response.json();
      console.log('Categories response:', result);

      if (result.error) throw new Error(result.error);
      setCategories(result.data || []);
      console.log('Categories loaded:', result.data?.length || 0);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const result = await response.json();

      if (result.error) throw new Error(result.error);
      setProducts(result.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateImageFile(file);
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Invalid file');
        e.target.value = ''; // Clear the input
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting product submission...');
    console.log('Auth token from localStorage (auth_token):', localStorage.getItem('auth_token'));
    console.log('Auth token from localStorage (token):', localStorage.getItem('token'));
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);
    console.log('Form data:', formData);
    
    // Check if user is logged in
    if (!user) {
      toast.error('You must be logged in to create products');
      console.error('No user found - redirecting to login');
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (!isAdmin) {
      toast.error('You must be an admin to create products');
      console.error('User is not admin:', user);
      return;
    }
    
    if (!formData.name || !formData.price || !formData.category || !formData.brand) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      let imagePath = '';
      if (selectedImage) {
        console.log('Uploading image...');
        setUploading(true);
        imagePath = await uploadImageToLocal(selectedImage);
        console.log('Image uploaded successfully:', imagePath);
        setUploading(false);
      } else if (editingProduct) {
        imagePath = editingProduct.image;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        brand: formData.brand,
        image: imagePath,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews: formData.reviews ? parseInt(formData.reviews) : null,
      };

      console.log('Product data to submit:', productData);

      if (editingProduct) {
        // Update existing product
        console.log('Updating product:', editingProduct.id);
        // TODO: Implement update logic with fetch if needed
        toast.error('Product update not implemented yet');
      } else {
        // Create new product
        console.log('Creating new product...');
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(productData),
        });
        const result = await response.json();
        console.log('Product creation result:', result);
        if (!response.ok || result.error) throw new Error(result.error || 'Failed to create product');
        toast.success('Product created successfully!');
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price, // Already a string
      category: product.category,
      brand: product.brand,
      original_price: product.original_price || '',
      rating: product.rating || '',
      reviews: product.reviews?.toString() || '',
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      const result = await localClient.from('products').delete().eq('id', productId).select();

      if (result.error) throw new Error(result.error);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      original_price: '',
      rating: '',
      reviews: '',
    });
    setSelectedImage(null);
    setImagePreview('');
    setEditingProduct(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminLayout title="Product Management">
      <Helmet>
        <title>Admin Products -  Selta Magic </title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header with Add Product Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                <Upload className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex flex-col space-y-3">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-selta-deep-purple file:text-white hover:file:bg-selta-deep-purple/90"
                    />
                    <p className="text-sm text-gray-500">
                      Upload JPEG, PNG, GIF, or WebP images up to 5MB
                    </p>
                    {imagePreview && (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {uploading && (
                      <div className="text-sm text-blue-600">Uploading image...</div>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand name"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="original_price">Original Price</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Rating and Reviews */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || uploading} 
                    className="bg-selta-deep-purple hover:bg-selta-deep-purple/90"
                  >
                    {loading || uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-lg">Loading products...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No products found. Add your first product!
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={resolveImageUrl(product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={createImageErrorHandler()}
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">${parseFloat(product.price).toFixed(2)}</span>
                            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                              <span className="text-sm text-gray-500 line-through">
                                ${parseFloat(product.original_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {product.rating && (
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-medium">{parseFloat(product.rating).toFixed(1)}</span>
                              </div>
                            )}
                            {product.reviews && (
                              <span className="text-sm text-gray-500">
                                {product.reviews} reviews
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
