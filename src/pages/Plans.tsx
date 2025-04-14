
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlanFeatures = {
  free: [
    { feature: 'Content scheduling', included: true },
    { feature: 'Basic analytics', included: true },
    { feature: 'Up to 5 social accounts', included: true },
    { feature: 'Email support', included: true },
    { feature: 'Brand deal management', included: false },
    { feature: 'Advanced analytics', included: false },
    { feature: 'Media kit generator', included: false },
    { feature: 'Priority support', included: false },
  ],
  pro: [
    { feature: 'Content scheduling', included: true },
    { feature: 'Advanced analytics', included: true },
    { feature: 'Unlimited social accounts', included: true },
    { feature: 'Brand deal management', included: true },
    { feature: 'Media kit generator', included: true },
    { feature: 'Priority support', included: true },
    { feature: 'Custom branded reports', included: true },
    { feature: 'API access', included: true },
  ]
};

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const isUserPro = user?.plan === 'pro';

  const handleSelectPlan = (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      toast({
        title: "Free Plan Selected",
        description: "You're now on the Free plan",
      });
      return;
    }
    
    // For Pro plan, simulate payment flow
    setIsLoading(true);
    
    // Simulate API call to create checkout session
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real app, redirect to Stripe checkout
      // For demo, we'll just simulate upgrade
      toast({
        title: "Upgrade Successful",
        description: "You've been upgraded to the Pro plan!",
      });
      
      // After successful payment, user would be redirected back to the app
      // with updated subscription status
    }, 1500);
  };

  return (
    <div className="container py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the plan that best fits your needs. Upgrade anytime to unlock more powerful features.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className={`relative ${isUserPro ? 'opacity-75' : ''}`}>
          {user?.plan === 'free' && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <span className="bg-secondary text-secondary-foreground text-sm font-medium py-1 px-3 rounded-full">
                Your Current Plan
              </span>
            </div>
          )}
          <Card className={`h-full border-2 ${user?.plan === 'free' ? 'border-primary' : 'border-border'}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Free Plan</span>
                <span className="text-2xl">$0</span>
              </CardTitle>
              <p className="text-muted-foreground">Get started with essential tools</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {PlanFeatures.free.map((item, index) => (
                <div key={index} className="flex items-center">
                  {item.included ? (
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mr-2" />
                  )}
                  <span className={item.included ? '' : 'text-muted-foreground'}>
                    {item.feature}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant={user?.plan === 'free' ? 'secondary' : 'outline'}
                onClick={() => handleSelectPlan('free')}
                disabled={user?.plan === 'free' || isLoading}
              >
                {user?.plan === 'free' ? 'Current Plan' : 'Select Free Plan'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Pro Plan */}
        <div className="relative">
          {isUserPro && (
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <span className="bg-secondary text-secondary-foreground text-sm font-medium py-1 px-3 rounded-full">
                Your Current Plan
              </span>
            </div>
          )}
          <Card className={`h-full border-2 ${isUserPro ? 'border-primary' : 'border-border'}`}>
            <CardHeader>
              <div className="absolute top-4 right-4">
                <span className="bg-primary text-primary-foreground text-xs font-bold py-0.5 px-2 rounded-sm">
                  RECOMMENDED
                </span>
              </div>
              <CardTitle className="flex justify-between items-center">
                <span>Pro Plan</span>
                <div>
                  <span className="text-2xl">$29</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardTitle>
              <p className="text-muted-foreground">For serious creators</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {PlanFeatures.pro.map((item, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{item.feature}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant={isUserPro ? 'secondary' : 'default'}
                onClick={() => handleSelectPlan('pro')}
                disabled={isUserPro || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                    Processing...
                  </>
                ) : isUserPro ? 'Current Plan' : 'Upgrade to Pro'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 max-w-lg mx-auto">
        <Card className="bg-muted">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Free plan limitations</p>
              <p className="text-sm text-muted-foreground">
                Free plans are limited to 5 social accounts and basic analytics. 
                Upgrade to Pro for unlimited accounts, advanced analytics, and priority support.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Need a custom plan for your business or agency?</p>
          <Button variant="link" className="p-0 h-auto font-normal">Contact us</Button>
        </div>
      </div>
    </div>
  );
};

export default Plans;
