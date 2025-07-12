
import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const SubscriptionStatus = () => {
  const { subscription, loading, openCustomerPortal, isSubscribed } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <Button
        onClick={() => navigate('/pricing')}
        variant="outline"
        size="sm"
        className="border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10"
      >
        <Crown className="h-4 w-4 mr-2" />
        Upgrade
      </Button>
    );
  }

  const getTierIcon = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return <Star className="h-4 w-4" />;
      case 'premium':
        return <Zap className="h-4 w-4" />;
      case 'enterprise':
        return <Crown className="h-4 w-4" />;
      default:
        return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-400/10 rounded-full">
        {getTierIcon(subscription?.subscription_tier)}
        <span className="text-sm text-emerald-400 font-medium">
          {subscription?.subscription_tier || 'Premium'}
        </span>
      </div>
      
      <Button
        onClick={openCustomerPortal}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        Manage
      </Button>
    </div>
  );
};

export default SubscriptionStatus;
