
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define the price IDs (you'll replace these with your actual Stripe price IDs)
const PRICE_IDS = {
  basic: 'price_1O5CLJDRHhVfFinsm4t1F2NC',
  pro: 'price_1O5CMDDRHhVfFinseZenlxsj'
};

const Plans = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    plan,
    subscribed,
    currentPeriodEnd,
    startCheckout,
    openCustomerPortal
  } = useSubscription();
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleSubscribe = (priceId: string, planName: 'free' | 'basic' | 'pro') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to subscribe to a plan',
        variant: 'destructive'
      });
      return;
    }
    
    startCheckout(priceId, planName);
  };
  
  const handleManageSubscription = () => {
    if (!user || !subscribed) {
      toast({
        title: 'No active subscription',
        description: 'You don\'t have an active subscription to manage.',
        variant: 'destructive'
      });
      return;
    }
    
    openCustomerPortal();
  };

  return (
    <div className="container max-w-6xl py-12">
      <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
      <p className="text-muted-foreground mb-8">Choose the plan that works best for your creator journey</p>
      
      {subscribed && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              You are currently on the <span className="font-bold text-primary">{plan.toUpperCase()}</span> plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Your subscription renews on {formatDate(currentPeriodEnd)}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card className={`border ${plan === 'free' ? 'border-primary border-2' : ''}`}>
          <CardHeader>
            {plan === 'free' && (
              <div className="absolute top-4 right-4 bg-primary text-white text-xs py-1 px-2 rounded-full">
                Current Plan
              </div>
            )}
            <CardTitle>Free</CardTitle>
            <CardDescription>Get started with basic features</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included>Connect 1 social account</PlanFeature>
            <PlanFeature included>Basic analytics</PlanFeature>
            <PlanFeature included>Message brands</PlanFeature>
            <PlanFeature>No commission on deals</PlanFeature>
            <PlanFeature>Advanced analytics</PlanFeature>
            <PlanFeature>Priority support</PlanFeature>
          </CardContent>
          <CardFooter>
            <Button
              variant={plan === 'free' ? 'outline' : 'default'}
              className="w-full"
              disabled={plan === 'free' || isLoading}
            >
              {plan === 'free' ? 'Current Plan' : 'Select Free Plan'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Basic Plan */}
        <Card className={`border ${plan === 'basic' ? 'border-primary border-2' : ''}`}>
          <CardHeader>
            {plan === 'basic' && (
              <div className="absolute top-4 right-4 bg-primary text-white text-xs py-1 px-2 rounded-full">
                Current Plan
              </div>
            )}
            <CardTitle>Basic</CardTitle>
            <CardDescription>Perfect for emerging creators</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included>Connect 3 social accounts</PlanFeature>
            <PlanFeature included>Advanced analytics</PlanFeature>
            <PlanFeature included>Message brands</PlanFeature>
            <PlanFeature included>8% commission on deals</PlanFeature>
            <PlanFeature>Custom branding</PlanFeature>
            <PlanFeature>Priority support</PlanFeature>
          </CardContent>
          <CardFooter>
            {plan === 'basic' ? (
              <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={() => handleSubscribe(PRICE_IDS.basic, 'basic')}
              >
                {isLoading ? 'Processing...' : 'Subscribe'}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Pro Plan */}
        <Card className={`border ${plan === 'pro' ? 'border-primary border-2' : ''} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 text-white text-xs py-1 px-4 rotate-45 translate-x-8 translate-y-2">
            POPULAR
          </div>
          <CardHeader>
            {plan === 'pro' && (
              <div className="absolute top-4 right-4 bg-primary text-white text-xs py-1 px-2 rounded-full">
                Current Plan
              </div>
            )}
            <CardTitle>Pro</CardTitle>
            <CardDescription>For professional content creators</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included>Connect unlimited social accounts</PlanFeature>
            <PlanFeature included>Comprehensive analytics</PlanFeature>
            <PlanFeature included>Message brands</PlanFeature>
            <PlanFeature included>5% commission on deals</PlanFeature>
            <PlanFeature included>Custom branding</PlanFeature>
            <PlanFeature included>Priority support</PlanFeature>
          </CardContent>
          <CardFooter>
            {plan === 'pro' ? (
              <Button variant="outline" className="w-full" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={() => handleSubscribe(PRICE_IDS.pro, 'pro')}
              >
                {isLoading ? 'Processing...' : 'Subscribe'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Separator className="my-12" />
      
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-6 text-left">
          <div>
            <h3 className="font-bold mb-2">How do I upgrade my plan?</h3>
            <p className="text-muted-foreground">
              Select the plan you want above and click 'Subscribe'. You'll be directed to our secure payment provider to complete your subscription.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time through the 'Manage Subscription' button. Your benefits will continue until the end of your billing period.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">How are commissions calculated on brand deals?</h3>
            <p className="text-muted-foreground">
              The commission is calculated based on the total value of the brand deal. The percentage varies based on your subscription plan, with Pro users getting the lowest rates.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We don't offer refunds for subscription payments, but you can cancel anytime to prevent future charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for features
interface PlanFeatureProps {
  included?: boolean;
  children: React.ReactNode;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ included, children }) => {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={included ? '' : 'text-muted-foreground'}>{children}</span>
    </div>
  );
};

export default Plans;
