
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Video, Zap, Star, ExternalLink } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  popular: boolean;
  priceId: string | null;
}

// TODO: Replace these with your actual Stripe price IDs from your Dashboard
// Go to https://dashboard.stripe.com/products to find your real price IDs
const STRIPE_PRICE_IDS = {
  premium: 'price_1REPLACE_WITH_YOUR_PREMIUM_PRICE_ID', // Replace with your actual Premium price ID
  pro: 'price_1REPLACE_WITH_YOUR_PRO_PRICE_ID',         // Replace with your actual Pro price ID
};

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out TaleForge',
    features: [
      'Create up to 3 stories',
      'Basic story modes',
      'Text-based stories',
      'Community features',
      'Mobile responsive'
    ],
    limitations: [
      'No video compilation',
      'No audio generation',
      'Limited story segments'
    ],
    cta: 'Get Started',
    popular: false,
    priceId: null,
  },
  {
    name: 'Premium',
    price: '$9.99',
    description: 'Unlock the full storytelling experience',
    features: [
      'Unlimited stories',
      'All story modes & genres',
      'AI audio narration',
      'High-quality images',
      'Video compilation',
      'Priority support',
      'Export options'
    ],
    cta: 'Start Premium',
    popular: true,
    priceId: STRIPE_PRICE_IDS.premium,
  },
  {
    name: 'Pro',
    price: '$24.99',
    description: 'For creators who want the best',
    features: [
      'Everything in Premium',
      'Advanced AI models',
      'Custom voice selection',
      '4K video compilation',
      'Batch processing',
      'API access',
      'White-label options',
      'Priority processing'
    ],
    cta: 'Go Pro',
    popular: false,
    priceId: STRIPE_PRICE_IDS.pro,
  },
];

const Pricing: React.FC = () => {
  const { isSubscribed, subscription_tier, isAuthenticated } = useSubscription();
  const { mutate: checkout, isPending: isCheckingOut } = useStripeCheckout();
  const { mutate: openPortal, isPending: isOpeningPortal } = useCustomerPortal();

  const handleSubscribe = (priceId: string, tierName: string) => {
    if (!isAuthenticated) {
      window.location.href = '/auth?redirect=/pricing';
      return;
    }
    
    if (priceId) {
      console.log('Starting checkout for:', { priceId, tierName });
      checkout({ priceId, tier: tierName });
    } else {
      console.error('No price ID provided for tier:', tierName);
    }
  };

  const handleManageBilling = () => {
    openPortal();
  };

  const isUsingPlaceholderPrices = 
    STRIPE_PRICE_IDS.premium.includes('REPLACE_WITH_YOUR') || 
    STRIPE_PRICE_IDS.pro.includes('REPLACE_WITH_YOUR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Choose Your Adventure
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full power of AI storytelling with premium features like video compilation, 
            audio narration, and unlimited creative freedom.
          </p>
        </div>

        {/* Configuration Notice */}
        {isUsingPlaceholderPrices && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs text-white font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">Price IDs Need to be Updated</h3>
                <p className="text-amber-700 mb-3">
                  Replace the placeholder price IDs in the code with your actual Stripe price IDs to enable checkout.
                </p>
                <div className="space-y-2 text-sm text-amber-600">
                  <p><strong>Current placeholders:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Premium: {STRIPE_PRICE_IDS.premium}</li>
                    <li>Pro: {STRIPE_PRICE_IDS.pro}</li>
                  </ul>
                  <p className="mt-2"><strong>Replace with real price IDs from your Stripe Dashboard</strong></p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 bg-white hover:bg-amber-50"
                  onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const isCurrentTier = isSubscribed && subscription_tier === tier.name;
            const isFree = tier.name === 'Free';
            const isDisabled = !isFree && isUsingPlaceholderPrices;
            
            return (
              <Card 
                key={tier.name}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  tier.popular 
                    ? 'border-2 border-primary shadow-lg scale-105' 
                    : 'border border-border'
                } ${isCurrentTier ? 'ring-2 ring-green-500' : ''} ${
                  isDisabled ? 'opacity-75' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentTier && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white border-0">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {tier.name === 'Free' && <Zap className="w-6 h-6 text-blue-500" />}
                    {tier.name === 'Premium' && <Crown className="w-6 h-6 text-purple-500" />}
                    {tier.name === 'Pro' && <Video className="w-6 h-6 text-pink-500" />}
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {!isFree && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    {isCurrentTier && isSubscribed ? (
                      <Button
                        onClick={handleManageBilling}
                        disabled={isOpeningPortal}
                        variant="outline"
                        className="w-full"
                      >
                        {isOpeningPortal ? 'Opening...' : 'Manage Billing'}
                      </Button>
                    ) : isFree ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = '/'}
                      >
                        {tier.cta}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => tier.priceId && handleSubscribe(tier.priceId, tier.name)}
                        disabled={isCheckingOut || !tier.priceId || isDisabled}
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                            : ''
                        }`}
                        title={isDisabled ? 'Update price IDs in code first' : ''}
                      >
                        {isDisabled ? 'Update Price IDs' : isCheckingOut ? 'Loading...' : tier.cta}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Showcase */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 mx-auto flex items-center justify-center">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">AI Video Compilation</h3>
              <p className="text-muted-foreground">
                Transform your stories into cinematic videos with AI-powered editing, 
                transitions, and effects.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Audio Narration</h3>
              <p className="text-muted-foreground">
                Professional AI voices bring your stories to life with natural, 
                expressive narration.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 mx-auto flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Unlimited Creativity</h3>
              <p className="text-muted-foreground">
                No limits on story creation, advanced AI models, and priority 
                processing for the best experience.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 text-muted-foreground">
          <p className="mb-2">✨ Start with our free tier - no credit card required</p>
          <p className="mb-2">🔒 Secure payment processing by Stripe</p>
          <p>📞 Cancel anytime with one-click billing management</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
