import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage or database on component mount
  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    setLoading(true);
    try {
      if (user) {
        // Load from database for logged-in users
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            setCartItems(result.data || []);
          } else {
            console.error('Failed to load cart from database');
            loadFromLocalStorage();
          }
        } else {
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage for non-logged-in users
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    }
  };

  // Save cart to localStorage for non-logged-in users
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, user]);

  const addToCart = async (product: any, quantity = 1) => {
    try {
      setLoading(true);
      
      // Validate product data
      if (!product || !product.id) {
        throw new Error('Invalid product data. Product information is missing.');
      }
      
      if (!product.name || !product.price) {
        throw new Error('Product information is incomplete. Please try refreshing the page.');
      }
      
      if (quantity <= 0) {
        throw new Error('Invalid quantity. Please select a valid quantity.');
      }
      
      if (user) {
        // Add to database for logged-in users
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required. Please log in to continue.');
        }
        
        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: quantity
          }),
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to add item to cart';
          
          if (response.status === 404) {
            errorMessage = 'Product not found. The product may have been removed or is no longer available.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication expired. Please log in again.';
          } else if (response.status === 400) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = 'Invalid request. Please check the product details and try again.';
            }
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              // Keep default error message
            }
          }
          
          console.error('Failed to add to database cart:', response.status, errorMessage);
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        // Reload cart from database
        await loadCart();
      } else {
        // Add to localStorage for non-logged-in users
        setCartItems(prevItems => {
          // Check if item already exists in cart
          const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
          
          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            };
            return updatedItems;
          } else {
            // Add new item to cart
            const newItem = {
              id: product.id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              quantity,
              image: product.image_url || product.image || '/placeholder.svg'
            };
            const newItems = [...prevItems, newItem];
            return newItems;
          }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Re-throw with a user-friendly message if it's a generic error
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      
      if (user) {
        // Remove from database for logged-in users
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            // Reload cart from database
            await loadCart();
          } else {
            const error = await response.json();
            console.error('Failed to remove from database cart:', error);
          }
        }
      } else {
        // Remove from localStorage for non-logged-in users
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      if (user) {
        // Update in database for logged-in users
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });
          
          if (response.ok) {
            // Reload cart from database
            await loadCart();
          } else {
            const error = await response.json();
            console.error('Failed to update quantity in database cart:', error);
          }
        }
      } else {
        // Update in localStorage for non-logged-in users
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Clear database cart for logged-in users
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            setCartItems([]);
          } else {
            const error = await response.json();
            console.error('Failed to clear database cart:', error);
          }
        }
      } else {
        // Clear localStorage cart for non-logged-in users
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(String(item.price)) * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
