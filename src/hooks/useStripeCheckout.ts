import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutParams {
  priceId: string;
  tier: string;
}

const createCheckoutSession = async ({ priceId, tier }: CheckoutParams) => {
  const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
    body: { priceId, tier },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return data;
};

export const useStripeCheckout = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      console.error('Checkout error:', error);
      toast.error(`Failed to start checkout: ${error.message}`);
    },
  });
};