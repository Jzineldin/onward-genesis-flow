
import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

const Pricing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      icon: <Star className="h-6 w-6" />,
      description: 'Perfect for casual storytellers',
      features: [
        '10 stories per month',
        'Basic AI narration',
        'Standard image generation',
        'Community access'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      icon: <Zap className="h-6 w-6" />,
      description: 'Best for regular creators',
      features: [
        'Unlimited stories',
        'Premium AI narration',
        'High-quality images',
        'Priority support',
        'Advanced customization',
        'Export to PDF/ebook'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49.99',
      icon: <Crown className="h-6 w-6" />,
      description: 'For professional storytellers',
      features: [
        'Everything in Premium',
        'Custom AI training',
        'White-label options',
        'API access',
        'Dedicated support',
        'Analytics dashboard'
      ],
      popular: false
    }
  ];

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      setLoading(tier);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.subscribed && 
           subscription?.subscription_tier?.toLowerCase() === planId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of AI-powered storytelling with our subscription plans
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-white/5 border-white/20 backdrop-blur-sm ${
                plan.popular ? 'ring-2 ring-emerald-400 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-400 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4 text-emerald-400">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {plan.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <CardDescription className="text-gray-300">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || isCurrentPlan(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600' 
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  } text-white font-semibold py-3`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan(plan.id) ? (
                    'Current Plan'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscription?.subscribed && (
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-4">
              Current Plan: <span className="text-emerald-400 font-semibold">{subscription.subscription_tier}</span>
            </p>
            <Button
              onClick={() => supabase.functions.invoke('customer-portal').then(({ data }) => window.open(data.url, '_blank'))}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Manage Subscription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
