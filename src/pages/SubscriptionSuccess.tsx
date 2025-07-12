
import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check subscription status after successful payment
    const checkSubscription = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Premium!
          </h1>
          <p className="text-gray-300">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold"
          >
            Start Creating Stories
          </Button>
          
          <Button
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            View Subscription Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
