import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Truck, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { userOrderService, UserOrder } from '@/services/userOrderService';

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login?redirect=/orders');
      toast.error('Please log in to view your orders');
      return;
    }

    fetchOrders();
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userOrders = await userOrderService.getUserOrders();
      setOrders(userOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: UserOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (order: UserOrder) => {
    setSelectedOrder(order);
  };

  if (!user || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error loading orders</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <Button onClick={fetchOrders} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <Helmet>
        <title>My Orders - Selta Magic  </title>
      </Helmet>

      {selectedOrder ? (
        // Order Details View
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => setSelectedOrder(null)} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Order Details</CardTitle>
                  <p className="text-gray-600">Order #{selectedOrder.order_number}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedOrder.status)}
                    <Badge 
                      className={`${userOrderService.getStatusDisplay(selectedOrder.status).bgColor} ${userOrderService.getStatusDisplay(selectedOrder.status).color}`}
                    >
                      {userOrderService.getStatusDisplay(selectedOrder.status).label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ordered on {userOrderService.formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {item.product_image && (
                        <img 
                          src={item.product_image} 
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{userOrderService.formatCurrency(Number(item.price) * Number(item.quantity))}</p>
                        <p className="text-sm text-gray-600">{userOrderService.formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                    <p>{selectedOrder.shipping_address_line_1}</p>
                    {selectedOrder.shipping_address_line_2 && <p>{selectedOrder.shipping_address_line_2}</p>}
                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}</p>
                    <p>{selectedOrder.shipping_country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-bold text-lg">{userOrderService.formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">Tracking Number:</p>
                        <a 
                          href={userOrderService.getTrackingUrl(selectedOrder.tracking_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {selectedOrder.tracking_number}
                        </a>
                      </div>
                    )}
                    {selectedOrder.shipped_at && (
                      <div className="text-sm text-gray-600">
                        <p>Shipped: {userOrderService.formatDate(selectedOrder.shipped_at)}</p>
                      </div>
                    )}
                    {selectedOrder.delivered_at && (
                      <div className="text-sm text-gray-600">
                        <p>Delivered: {userOrderService.formatDate(selectedOrder.delivered_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Orders List View
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your order history</p>
            </div>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders. Start shopping to see your orders here.
                </p>
                <Link to="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge 
                              className={`${userOrderService.getStatusDisplay(order.status).bgColor} ${userOrderService.getStatusDisplay(order.status).color}`}
                            >
                              {userOrderService.getStatusDisplay(order.status).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Date:</span>
                            <p>{userOrderService.formatDate(order.created_at)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Total:</span>
                            <p className="font-semibold text-gray-900">{userOrderService.formatCurrency(order.total_amount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Items:</span>
                            <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <span className="font-medium">Ship to:</span>
                            <p>{order.shipping_city}, {order.shipping_state}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={() => handleViewDetails(order)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        {order.tracking_number && (
                          <Button 
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a 
                              href={userOrderService.getTrackingUrl(order.tracking_number)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Track Package
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
