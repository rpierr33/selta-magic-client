import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface CheckoutFormProps {
  amount: number;
  cartItems: any[];
  shippingAddress: any;
  onSuccess: (orderId: string) => void;
}

export default function CheckoutForm({ amount, cartItems, shippingAddress, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [formDisabled, setFormDisabled] = useState(false);
  const { toast } = useToast();

  // Create payment intent on component mount
  useEffect(() => {
    if (!user || !cartItems.length || !shippingAddress) {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/stripe/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            cartItems,
            shippingAddress
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Payment intent error response:', errorData);
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createPaymentIntent();
  }, [amount, cartItems, shippingAddress, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formDisabled) return;

    if (!stripe || !elements || !clientSecret) {
      toast({
        title: "Error",
        description: "Payment system not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        setFormDisabled(true); // Disable form after success
        // Confirm payment on server and create order
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/stripe/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to confirm payment');
        }

        const { orderId } = await response.json();
        toast({
          title: "Payment successful!",
          description: `Your payment of $${amount.toFixed(2)} has been processed successfully.`,
        });
        setClientSecret(null); // Prevent resubmission with same PaymentIntent
        onSuccess(orderId); // Redirect or show success
        return;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Initializing payment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-md bg-white">
          <label className="block text-sm font-medium mb-2">Card Information</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            disabled={formDisabled}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading || formDisabled} 
          className="w-full bg-selta-gold text-selta-deep-purple hover:bg-selta-gold/90 font-bold py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          Your payment is secured by Stripe. Your card information is never stored on our servers.
        </p>
      </form>
    </div>
  );
}
