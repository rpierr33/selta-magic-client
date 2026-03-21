const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface UserOrder {
  id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number | string; // Can come as string from database
  created_at: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number | string; // Can come as string from database
    price: number | string; // Can come as string from database
    product_image?: string;
  }>;
}

export interface OrdersResponse {
  orders: UserOrder[];
}

export const userOrderService = {
  // Get user's orders
  async getUserOrders(): Promise<UserOrder[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch orders: ${errorText}`);
    }

    const data = await response.json();
    return data.orders || data.data || [];
  },

  // Get specific order details
  async getOrderDetails(orderId: string): Promise<UserOrder> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 404) {
        throw new Error('Order not found.');
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch order details: ${errorText}`);
    }

    const data = await response.json();
    return data.order || data.data;
  },

  // Format order status for display
  getStatusDisplay(status: string): { label: string; color: string; bgColor: string } {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
      processing: { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      shipped: { label: 'Shipped', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
      cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
      refunded: { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };
    return statusMap[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  },

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format currency
  formatCurrency(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numericAmount.toFixed(2)}`;
  },

  // Get tracking URL based on carrier (if available)
  getTrackingUrl(trackingNumber: string): string {
    // Default to Google search for tracking number
    return `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}+tracking`;
  },
};
