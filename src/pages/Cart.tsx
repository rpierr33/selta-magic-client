import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ChevronLeft, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAddresses } from "@/hooks/useAddresses";
import CheckoutForm from "@/components/stripe/CheckoutForm";
import AddressList from "@/components/address/AddressList";
import { resolveImageUrl } from "@/utils/imageUtils";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, loading } = useCart();
  const { user } = useAuth();
  const { hasShippingAddress, addresses } = useAddresses();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Get default shipping address
  const defaultShippingAddress = addresses.find(addr => addr.type === 'shipping' && addr.is_default);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    // Check if user has a shipping address
    if (!hasShippingAddress()) {
      toast({
        title: "Shipping address required",
        description: "Please add a shipping address to proceed with checkout",
        variant: "destructive",
      });
      setShowAddressForm(true);
      return;
    }
    
    // Show Stripe checkout form instead of just showing a toast
    setShowStripeForm(true);
  };
  
  const handlePaymentSuccess = (orderId: string) => {
    // Clear the cart after successful payment
    clearCart();
    
    toast({
      title: "Order completed",
      description: `Thank you for your purchase! Your order has been placed successfully. You can track your order in "My Orders".`,
    });
    
    // Redirect to orders page after a short delay
    setTimeout(() => {
      navigate("/orders");
    }, 2000);
  };
  
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: promoCode ? "Promo code applied" : "Please enter a promo code",
      description: promoCode ? "Discount has been applied to your order" : "Enter a valid promo code to receive a discount",
    });
    setPromoCode("");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-selta-deep-purple mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-selta-deep-purple mb-2">Loading your cart...</h1>
            <p className="text-gray-600">Please wait while we fetch your items.</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h1 className="text-2xl font-bold text-selta-deep-purple mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/products">
              <Button className="bg-selta-deep-purple hover:bg-selta-deep-purple/90">
                <ChevronLeft className="h-4 w-4 mr-2" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.07; // 7% tax rate
  const total = subtotal + shipping + tax;
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-selta-deep-purple mb-1">Shopping Cart</h1>
          <p className="text-gray-600 mb-8">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 border-b border-gray-100 last:border-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-24">
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-selta-deep-purple">{item.name}</h3>
                        <p className="text-selta-gold font-bold mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                          >
                            -
                          </Button>
                          <span className="w-10 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-md"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={loading}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 flex justify-between">
                  <Button
                    variant="outline"
                    className="text-gray-600"
                    onClick={handleClearCart}
                    disabled={loading}
                  >
                    Clear Cart
                  </Button>
                  <Link to="/products">
                    <Button variant="ghost" className="text-selta-deep-purple">
                      <ChevronLeft className="h-4 w-4 mr-2" /> Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-selta-deep-purple mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (7%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between">
                    <span className="font-bold text-selta-deep-purple">Total</span>
                    <span className="font-bold text-selta-deep-purple">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {showAddressForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-2 mb-2">
                      <h3 className="font-medium text-selta-deep-purple">Add Shipping Address</h3>
                    </div>
                    
                    <AddressList 
                      type="shipping"
                      onAddressSelected={() => {
                        setShowAddressForm(false);
                        setShowStripeForm(true);
                      }}
                    />
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowAddressForm(false)}
                    >
                      Back to Cart
                    </Button>
                  </div>
                ) : !showStripeForm ? (
                  <>
                    <form onSubmit={handleApplyPromo} className="mb-6">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <Button type="submit" variant="outline">Apply</Button>
                      </div>
                    </form>
                    
                    <Button 
                      className="w-full bg-selta-gold text-selta-deep-purple hover:bg-selta-gold/90 font-bold"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-2 mb-2">
                      <CreditCard className="h-5 w-5 mr-2 text-selta-deep-purple" />
                      <h3 className="font-medium text-selta-deep-purple">Payment Details</h3>
                    </div>
                    
                    <CheckoutForm 
                      amount={total} 
                      cartItems={cartItems}
                      shippingAddress={defaultShippingAddress}
                      onSuccess={handlePaymentSuccess} 
                    />
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setShowStripeForm(false)}
                    >
                      Back to Cart
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Secure payment processing. Free shipping on orders over $50.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
