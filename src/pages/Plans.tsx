
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Users } from 'lucide-react';
import { PLAN_DETAILS, type UserPlan } from '@/lib/supabase';

const Plans: React.FC = () => {
  const { subscription, startCheckout, openCustomerPortal, isLoading, checkSubscription } = useSubscription();

  // Real Paddle price IDs - these need to be configured in your Paddle dashboard
  const planData = [
    {
      id: 'basic' as UserPlan,
      name: 'Basic',
      description: 'Perfect for individual creators getting started',
      icon: Zap,
      color: 'bg-blue-500',
      popular: false,
      paddlePrice: 'pri_basic_monthly_001' // Replace with actual Paddle price ID
    },
    {
      id: 'pro' as UserPlan,
      name: 'Pro',
      description: 'For growing creators and small teams',
      icon: Crown,
      color: 'bg-purple-500',
      popular: true,
      paddlePrice: 'pri_pro_monthly_001' // Replace with actual Paddle price ID
    },
    {
      id: 'enterprise' as UserPlan,
      name: 'Enterprise',
      description: 'For large teams and organizations',
      icon: Users,
      color: 'bg-orange-500',
      popular: false,
      paddlePrice: 'pri_enterprise_monthly_001' // Replace with actual Paddle price ID
    }
  ];

  const handleUpgrade = (priceId: string, planName: UserPlan) => {
    console.log('Starting checkout for plan:', planName, 'with price ID:', priceId);
    startCheckout(priceId, planName);
  };

  const handleCheckSubscription = () => {
    console.log('Checking subscription status...');
    checkSubscription();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features to grow your social media presence and streamline your content creation
        </p>
      </div>

      {subscription?.status === 'active' && (
        <div className="mb-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Current Plan: <Badge variant="default">{subscription.plan}</Badge>
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCustomerPortal}
                >
                  Manage Subscription
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckSubscription}
                >
                  Sync Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {planData.map((plan) => {
          const details = PLAN_DETAILS[plan.id];
          const IconComponent = plan.icon;
          const isCurrentPlan = subscription?.plan === plan.id;
          
          return (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${details.pricing.monthly}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{details.features.maxPosts} posts per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{details.features.maxUsers} team member{details.features.maxUsers > 1 ? 's' : ''}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>{details.features.maxSocialAccounts} social accounts</span>
                  </li>
                  {details.features.advancedAnalytics && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>Advanced analytics</span>
                    </li>
                  )}
                  {details.features.contentGeneration && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>AI content generation</span>
                    </li>
                  )}
                  {details.features.teamCollaboration && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>Team collaboration</span>
                    </li>
                  )}
                  {details.features.prioritySupport && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>Priority support</span>
                    </li>
                  )}
                  {details.features.customBranding && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>Custom branding</span>
                    </li>
                  )}
                  {details.features.apiAccess && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>API access</span>
                    </li>
                  )}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan}
                  onClick={() => !isCurrentPlan && handleUpgrade(plan.paddlePrice, plan.id)}
                >
                  {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Setup Required:</strong> Replace the Paddle price IDs above with your actual price IDs from your Paddle dashboard.
            Configure your Paddle webhook URL to: <code className="bg-yellow-100 px-1 rounded">https://lkezjcqdvxfrrfwwyjcp.supabase.co/functions/v1/paddle-webhook</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;
