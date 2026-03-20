import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  additional_info?: string;
  country: string;
  county?: string;
  region?: string;
  is_default: boolean;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load addresses');
      }

      const result = await response.json();
      setAddresses(result.data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasAddresses = () => {
    return addresses.length > 0;
  };

  const hasShippingAddress = () => {
    return addresses.some(addr => addr.type === 'shipping');
  };

  const hasBillingAddress = () => {
    return addresses.some(addr => addr.type === 'billing');
  };

  const getDefaultAddress = (type: 'shipping' | 'billing') => {
    return addresses.find(addr => addr.type === type && addr.is_default);
  };

  const getAddressesByType = (type: 'shipping' | 'billing') => {
    return addresses.filter(addr => addr.type === type);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  return {
    addresses,
    loading,
    loadAddresses,
    hasAddresses,
    hasShippingAddress,
    hasBillingAddress,
    getDefaultAddress,
    getAddressesByType,
  };
};
