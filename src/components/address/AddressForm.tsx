import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
// @ts-ignore
import countries from 'world-countries';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface AddressFormData {
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

interface AddressFormProps {
  onAddressAdded?: () => void;
  onCancel?: () => void;
  type?: 'shipping' | 'billing';
}

// Get all countries from world-countries library
const COUNTRIES = countries.map((country: any) => ({
  name: country.name.common,
  code: country.cca2
})).sort((a: any, b: any) => a.name.localeCompare(b.name));

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function AddressForm({ onAddressAdded, onCancel, type = 'shipping' }: AddressFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    type,
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    additional_info: '',
    country: 'United States', // Default to US
    county: '',
    region: '',
    is_default: true
  });

  // Populate user names from auth context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.firstName || '',
        last_name: user.lastName || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset county when country changes
      if (field === 'country') {
        newData.county = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Debug: Log form data before sending
      console.log('Form data being sent:', formData);
      console.log('Required fields check:', {
        first_name: !!formData.first_name,
        last_name: !!formData.last_name,
        phone: !!formData.phone,
        address: !!formData.address,
        country: !!formData.country
      });

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add address');
      }

      const result = await response.json();
      
      toast({
        title: "Address added",
        description: "Your address has been saved successfully.",
      });

      if (onAddressAdded) {
        onAddressAdded();
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-selta-deep-purple">
          Add {type === 'shipping' ? 'Shipping' : 'Billing'} Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+254 700 000 000"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your full address"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="additional_info">Additional Information (Optional)</Label>
            <Textarea
              id="additional_info"
              value={formData.additional_info}
              onChange={(e) => handleInputChange('additional_info', e.target.value)}
              placeholder="Apartment number, building name, delivery instructions, etc."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-60">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.country === 'United States' && (
            <div>
              <Label htmlFor="region">State</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleInputChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="h-60">
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleInputChange('is_default', checked === true)}
            />
            <Label htmlFor="is_default">Set as default {type} address</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-selta-deep-purple hover:bg-selta-deep-purple/90"
            >
              {loading ? 'Adding...' : 'Add Address'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
