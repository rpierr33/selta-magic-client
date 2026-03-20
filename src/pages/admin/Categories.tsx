import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Badge } from 'lucide-react';

// Category type
type Category = {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminCategories() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: '',
    is_active: true,
  });

  useEffect(() => {
    console.log('Categories page mounted, isAdmin:', isAdmin, 'user:', user);
    if (!isAdmin) {
      console.log('User is not admin, redirecting to login');
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      console.log('Fetching categories with token:', token ? 'present' : 'missing');
      
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Categories response status:', response.status);
      const result = await response.json();
      console.log('Categories result:', result);

      if (result.error) throw new Error(result.error);
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active,
      };

      let response;
      if (editingCategory) {
        // Update existing category
        console.log('Updating category:', editingCategory.id, 'with data:', categoryData);
        response = await fetch(`${API_BASE_URL}/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });
      } else {
        // Create new category
        console.log('Creating new category with data:', categoryData);
        response = await fetch(`${API_BASE_URL}/admin/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });
      }

      console.log('Save response status:', response.status);
      const result = await response.json();
      console.log('Save result:', result);

      if (result.error) throw new Error(result.error);
      
      toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order.toString(),
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to permanently delete this category? This action cannot be undone.')) return;

    try {
      setLoading(true);
      console.log('Deleting category with ID:', categoryId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Delete response status:', response.status);
      const result = await response.json();
      console.log('Delete result:', result);

      if (result.error) throw new Error(result.error);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      display_order: '',
      is_active: true,
    });
    setEditingCategory(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminLayout title="Category Management">
      <Helmet>
        <title>Admin Categories -  Selta Magic </title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header with Add Category Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categories</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
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
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500">Lower numbers appear first</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-selta-deep-purple hover:bg-selta-deep-purple/90"
                  >
                    {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-lg">Loading categories...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No categories found. Add your first category!
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.filter(category => category.is_active).map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>{category.display_order}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={`bg-selta-deep-purple text-white border-0 ${category.is_active ? '' : 'opacity-50'}`}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={!category.is_active}
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
