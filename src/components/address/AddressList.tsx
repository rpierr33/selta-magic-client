import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Trash2, Edit, Plus } from "lucide-react";
import AddressForm from "./AddressForm";

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

interface AddressListProps {
  onAddressSelected?: (address: Address) => void;
  selectMode?: boolean;
  type?: 'shipping' | 'billing';
}

export default function AddressList({ onAddressSelected, selectMode = false, type }: AddressListProps) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadAddresses = async () => {
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
      let addressData = result.data || [];
      
      // Filter by type if specified
      if (type) {
        addressData = addressData.filter((addr: Address) => addr.type === type);
      }
      
      setAddresses(addressData);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [type]);

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      toast({
        title: "Address deleted",
        description: "Address has been removed successfully.",
      });

      loadAddresses(); // Reload addresses
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address,
      address.additional_info,
      address.county && address.country === 'Kenya' ? address.county : undefined,
      address.region,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleAddressAdded = async () => {
    setShowAddForm(false);
    await loadAddresses();
    // After adding, select the new default address and proceed
    if (onAddressSelected) {
      // Find the default address of the current type
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const result = await response.json();
          let addressData = result.data || [];
          if (type) {
            addressData = addressData.filter((addr) => addr.type === type);
          }
          const defaultAddr = addressData.find((addr) => addr.is_default) || addressData[0];
          if (defaultAddr) onAddressSelected(defaultAddr);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-selta-deep-purple"></div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <AddressForm
        onAddressAdded={handleAddressAdded}
        onCancel={() => setShowAddForm(false)}
        type={type}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-selta-deep-purple">
          {type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Addresses` : 'Your Addresses'}
        </h3>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-selta-deep-purple hover:bg-selta-deep-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
            <p className="text-gray-600 mb-4">
              Add your first {type || 'shipping'} address to continue with checkout.
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-selta-deep-purple hover:bg-selta-deep-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectMode ? 'hover:border-selta-deep-purple' : ''
              }`}
              onClick={() => selectMode && onAddressSelected?.(address)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {address.first_name} {address.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {address.is_default && (
                      <Badge variant="secondary" className="bg-selta-gold text-selta-deep-purple">
                        Default
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {address.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm">{formatAddress(address)}</p>
                  <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  {address.additional_info && (
                    <p className="text-sm text-gray-600 italic">{address.additional_info}</p>
                  )}
                </div>
                
                {!selectMode && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit functionality
                        toast({
                          title: "Coming soon",
                          description: "Edit functionality will be available soon.",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
