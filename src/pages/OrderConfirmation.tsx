import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userOrderService, UserOrder } from '@/services/userOrderService';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [user, authLoading, orderId, navigate]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await userOrderService.getOrderDetails(id);
      setOrder(orderData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-selta-deep-purple" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Order Confirmed - Selta Magic</title>
      </Helmet>

      <div className="flex-grow flex items-center justify-center p-4 pt-24 pb-16 bg-gray-50">
        <div className="max-w-lg w-full mx-auto text-center">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
            {/* Animated Checkmark */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-20" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-100 animate-[bounce_1s_ease-in-out]">
                <CheckCircle className="w-14 h-14 text-green-500" strokeWidth={1.5} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-selta-deep-purple mb-3">
              Order Confirmed!
            </h1>

            {/* Order Number */}
            {order && !error ? (
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 mb-6">
                <Package className="w-4 h-4 text-selta-gold" />
                <span className="text-sm text-gray-600">Order</span>
                <span className="font-semibold text-selta-deep-purple">#{order.order_number}</span>
              </div>
            ) : error ? (
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 mb-6">
                <Package className="w-4 h-4 text-selta-gold" />
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="font-semibold text-selta-deep-purple">#{orderId}</span>
              </div>
            ) : null}

            {/* Summary Message */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              Thank you for your purchase! Your order has been placed successfully.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              We'll send you an email with your order details and tracking information once your order ships.
            </p>

            {/* Order Total */}
            {order && !error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm text-gray-900">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-lg font-bold text-selta-deep-purple">
                    {userOrderService.formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/orders" className="flex-1">
                <Button
                  className="w-full bg-selta-deep-purple hover:bg-selta-deep-purple/90 text-white font-semibold"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </Link>
              <Link to="/products" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-selta-deep-purple text-selta-deep-purple hover:bg-selta-deep-purple/5 font-semibold"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
