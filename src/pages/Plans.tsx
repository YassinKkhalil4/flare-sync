import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  const { 
    plan,
    subscribed,
    currentPeriodEnd,
    startCheckout,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();
  
  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading({...isLoading, [planName]: true});
    try {
      await startCheckout(priceId, planName.toLowerCase() as any);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
      setIsLoading({...isLoading, [planName]: false});
    }
  };
  
  const handleManageSubscription = async () => {
    setIsLoading({...isLoading, manage: true});
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open subscription management. Please try again.",
        variant: "destructive"
      });
      setIsLoading({...isLoading, manage: false});
    }
  };
  
  const handleRefreshSubscription = async () => {
    setIsLoading({...isLoading, refresh: true});
    try {
      await checkSubscription();
      toast({
        title: "Success",
        description: "Subscription status has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not refresh subscription status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading({...isLoading, refresh: false});
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Choose Your Plan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">$0 / month</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Access to basic features</li>
              <li>Limited content posts</li>
              <li>Community support</li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscribed ? (
              plan === 'free' ? (
                <Button variant="secondary" disabled>
                  {isLoading['free'] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Current Plan
                </Button>
              )
            ) : (
              <Button variant="outline" disabled>
                Get Started
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Basic Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>For growing creators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">$19 / month</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All free features</li>
              <li>Unlimited content posts</li>
              <li>Advanced analytics</li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscribed ? (
              plan === 'basic' ? (
                <Button variant="secondary" disabled>
                  {isLoading['basic'] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleSubscribe('price_1OlocDSB3KooqHkwHXaG9z9A', 'Basic')} disabled={isLoading['basic']}>
                  {isLoading['basic'] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Upgrade to Basic'
                  )}
                </Button>
              )
            ) : (
              <Button onClick={() => handleSubscribe('price_1OlocDSB3KooqHkwHXaG9z9A', 'Basic')} disabled={isLoading['basic']}>
                {isLoading['basic'] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Subscribe to Basic'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Pro Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For established creators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-bold">$49 / month</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All basic features</li>
              <li>Priority support</li>
              <li>Team collaboration tools</li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscribed ? (
              plan === 'pro' ? (
                <Button variant="secondary" disabled>
                  {isLoading['pro'] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleSubscribe('price_1OloeJSB3KooqHkwjvg3Cg9Y', 'Pro')} disabled={isLoading['pro']}>
                  {isLoading['pro'] ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              )
            ) : (
              <Button onClick={() => handleSubscribe('price_1OloeJSB3KooqHkwjvg3Cg9Y', 'Pro')} disabled={isLoading['pro']}>
                {isLoading['pro'] ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Subscribe to Pro'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Subscription Management */}
      {subscribed && (
        <div className="mt-8 border rounded-md p-4 bg-muted/50">
          <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
          <p>
            You are currently subscribed to the <strong>{plan}</strong> plan.
          </p>
          {currentPeriodEnd && (
            <p>
              Your subscription will renew on <strong>{formatDate(currentPeriodEnd)}</strong>.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={handleManageSubscription} disabled={isLoading['manage']}>
              {isLoading['manage'] ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Manage Subscription'
              )}
            </Button>
            <Button variant="secondary" onClick={handleRefreshSubscription} disabled={isLoading['refresh']}>
              {isLoading['refresh'] ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Refresh Status'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
