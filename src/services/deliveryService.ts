import { Order } from '@/types/delivery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface DeliveryApiResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const deliveryService = {
  // Get all orders for admin delivery management
  async getOrders(filters: OrderFilters = {}): Promise<DeliveryApiResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/admin/orders${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching orders from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch orders: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    
    // Transform API response to match our Order type
    const transformedOrders: Order[] = data.orders.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      customerName: order.customer_name,
      orderDate: order.order_date,
      status: order.status,
      total: parseFloat(order.total),
      address: {
        street: order.address.street,
        city: order.address.city,
        state: order.address.state,
        zipCode: order.address.zipCode,
        country: order.address.country,
      },
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      carrier: order.carrier,
      trackingUpdates: [], // We'll add this later if needed
      items: order.items?.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })) || [],
    }));

    return {
      orders: transformedOrders,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update order status: ${error}`);
    }
  },

  // Update tracking information
  async updateTrackingInfo(
    orderId: string, 
    trackingInfo: {
      tracking_number?: string;
      carrier?: string;
      estimated_delivery?: string;
    }
  ): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/tracking`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingInfo),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update tracking info: ${error}`);
    }
  },
};
