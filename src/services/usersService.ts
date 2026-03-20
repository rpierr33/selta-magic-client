const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export const usersService = {
  // Get all users (admin only)
  async getUsers(): Promise<UsersResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${errorText}`);
    }

    return await response.json();
  },

  // Update user role
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update user role: ${errorText}`);
    }
  },

  // Format currency for display
  formatCurrency: (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
};
