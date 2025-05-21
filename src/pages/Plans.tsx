import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Users, BarChart3, Crown, Headset, Palette, Code, UserPlus, Hash, Workflow, Lightbulb, CaptionsIcon, MonitorIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PLAN_DETAILS, isAgencyPlan, UserPlan } from '@/lib/supabase';
import { useUserRole } from '@/hooks/useUserRole';

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { userRole } = useUserRole();
  
  const { 
    plan,
    subscribed,
    currentPeriodEnd,
    startCheckout,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();

  const planData = {
    'basic': {
      title: 'Basic',
      description: 'For individual creators',
      priceId: { 
        monthly: 'price_1OlocDSB3KooqHkwHXaG9z9A', 
        yearly: 'price_1OPnB1SB3KooqHkwjvg6YTq3'
      },
      highlight: false,
      features: [
        { name: '30 posts per month', included: true },
        { name: '2 social media accounts', included: true },
        { name: 'Single user', included: true },
        { name: 'Email support', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Caption generation (5/month)', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false },
        { name: 'AI content recommendations', included: false },
        { name: 'Team collaboration', included: false },
      ]
    },
    'pro': {
      title: 'Pro',
      description: 'For growing creators',
      priceId: { 
        monthly: 'price_1OloeJSB3KooqHkwjvg3Cg9Y', 
        yearly: 'price_1OPnGKSB3KooqHkwdmgl5Xhr' 
      },
      highlight: true,
      features: [
        { name: '120 posts per month', included: true },
        { name: '5 social media accounts', included: true },
        { name: 'Up to 3 team members', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Caption generation (unlimited)', included: true },
        { name: 'AI content recommendations', included: true },
        { name: 'Engagement predictions', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Custom branding', included: false },
        { name: 'API access', included: false },
      ]
    },
    'enterprise': {
      title: 'Enterprise',
      description: 'For professional creators',
      priceId: { 
        monthly: 'price_1OPncKSB3KooqHkw6iGZk7NR', 
        yearly: 'price_1OPnd8SB3KooqHkwdXrJiZmJ' 
      },
      highlight: false,
      features: [
        { name: '500 posts per month', included: true },
        { name: '10 social media accounts', included: true },
        { name: 'Up to 10 team members', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Caption generation (unlimited)', included: true },
        { name: 'AI content recommendations', included: true },
        { name: 'Engagement predictions', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Automated scheduling', included: true },
        { name: 'Custom branding', included: true },
        { name: 'API access', included: true },
      ]
    },
    'agency-small': {
      title: 'Agency Small',
      description: 'For small agencies',
      priceId: { 
        monthly: 'price_1OPnehSB3KooqHkwxJBXioDx', 
        yearly: 'price_1OPnfiSB3KooqHkwNf9HvLtq' 
      },
      highlight: false,
      features: [
        { name: '1,000 posts per month', included: true },
        { name: '20 social media accounts', included: true },
        { name: 'Up to 25 team members', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Caption generation (unlimited)', included: true },
        { name: 'AI content recommendations', included: true },
        { name: 'Engagement predictions', included: true },
        { name: 'Automated scheduling', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Custom branding', included: true },
        { name: 'API access', included: true },
      ]
    },
    'agency-medium': {
      title: 'Agency Medium',
      description: 'For growing agencies',
      priceId: { 
        monthly: 'price_1OPnh1SB3KooqHkwpEWcaSHd', 
        yearly: 'price_1OPniCSB3KooqHkwUm2kobVn' 
      },
      highlight: false,
      features: [
        { name: '5,000 posts per month', included: true },
        { name: '50 social media accounts', included: true },
        { name: 'Up to 100 team members', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Caption generation (unlimited)', included: true },
        { name: 'AI content recommendations', included: true },
        { name: 'Engagement predictions', included: true },
        { name: 'Automated scheduling', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Custom branding', included: true },
        { name: 'API access', included: true },
      ]
    },
    'agency-large': {
      title: 'Agency Large',
      description: 'For established agencies',
      priceId: { 
        monthly: 'price_1OPnjrSB3KooqHkwLHL1gr8c', 
        yearly: 'price_1OPnkeSB3KooqHkwSwhUdWnE' 
      },
      highlight: false,
      features: [
        { name: '20,000 posts per month', included: true },
        { name: '100 social media accounts', included: true },
        { name: 'Up to 500 team members', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Caption generation (unlimited)', included: true },
        { name: 'AI content recommendations', included: true },
        { name: 'Engagement predictions', included: true },
        { name: 'Automated scheduling', included: true },
        { name: 'Team collaboration tools', included: true },
        { name: 'Custom branding', included: true },
        { name: 'API access', included: true },
      ]
    },
  };
  
  const handleSubscribe = async (planName: UserPlan) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }
    
    const priceId = planData[planName].priceId[billingCycle];
    if (!priceId) {
      toast({
        title: "Error",
        description: "This plan is not available for the selected billing cycle.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading({...isLoading, [planName]: true});
    try {
      await startCheckout(priceId, planName);
    } catch (error) {
      console.error('Checkout error:', error);
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
      console.error('Portal error:', error);
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
      console.error('Refresh error:', error);
      toast({
        title: "Error",
        description: "Could not refresh subscription status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading({...isLoading, refresh: false});
    }
  };
  
  useEffect(() => {
    if (user) {
      handleRefreshSubscription();
    }
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('posts')) return <Hash className="h-4 w-4" />;
    if (feature.includes('analytics')) return <BarChart3 className="h-4 w-4" />;
    if (feature.includes('social media accounts')) return <Hash className="h-4 w-4" />;
    if (feature.includes('team members') || feature.includes('user')) return <Users className="h-4 w-4" />;
    if (feature.includes('priority')) return <Crown className="h-4 w-4" />;
    if (feature.includes('support')) return <Headset className="h-4 w-4" />;
    if (feature.includes('branding')) return <Palette className="h-4 w-4" />;
    if (feature.includes('API')) return <Code className="h-4 w-4" />;
    if (feature.includes('collaboration')) return <UserPlus className="h-4 w-4" />;
    if (feature.includes('caption generation')) return <CaptionsIcon className="h-4 w-4" />;
    if (feature.includes('content recommendations')) return <Lightbulb className="h-4 w-4" />;
    if (feature.includes('scheduling')) return <Workflow className="h-4 w-4" />;
    if (feature.includes('engagement')) return <MonitorIcon className="h-4 w-4" />;
    return null;
  };

  const getPlanPrice = (planName: UserPlan) => {
    const pricing = PLAN_DETAILS[planName].pricing;
    return billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;
  };

  // Calculate monthly equivalent price for yearly plan
  const getMonthlyEquivalent = (planName: UserPlan) => {
    const pricing = PLAN_DETAILS[planName].pricing;
    return Math.round(pricing.yearly / 12);
  };

  const savingsPercentage = (planName: UserPlan) => {
    const pricing = PLAN_DETAILS[planName].pricing;
    if (pricing.monthly === 0) return 0;
    const monthlyCost = pricing.monthly * 12;
    const yearlyCost = pricing.yearly;
    return Math.round((1 - yearlyCost / monthlyCost) * 100);
  };

  // Check if the current plan allows access to a feature
  const hasFeatureAccess = (feature: string) => {
    const currentPlan = plan || 'basic';
    
    // Map features to plan tiers
    const featureAccess: Record<string, UserPlan[]> = {
      'Basic analytics': ['basic', 'pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Advanced analytics': ['pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Caption generation (5/month)': ['basic', 'pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Caption generation (unlimited)': ['pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'AI content recommendations': ['pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Engagement predictions': ['pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Team collaboration tools': ['pro', 'enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Automated scheduling': ['enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'Custom branding': ['enterprise', 'agency-small', 'agency-medium', 'agency-large'],
      'API access': ['enterprise', 'agency-small', 'agency-medium', 'agency-large']
    };
    
    // Check if the feature exists in our map and if the current plan is included
    const requiredPlans = featureAccess[feature];
    if (!requiredPlans) return true; // If we don't have rules for this feature, allow it
    
    return requiredPlans.includes(currentPlan);
  };

  return (
    <div className="container max-w-7xl py-12">
      <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
      <p className="text-muted-foreground mb-8">Select the plan that best fits your needs</p>
      
      <div className="mb-8">
        <Tabs 
          defaultValue="individual" 
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="individual">Individual Plans</TabsTrigger>
            <TabsTrigger value="agency">Agency Plans</TabsTrigger>
          </TabsList>
          
          <div className="my-6 flex justify-center">
            <div className="flex items-center space-x-2 bg-muted rounded-md p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className="relative"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className="relative"
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs">Save 15%+</Badge>
              </Button>
            </div>
          </div>
          
          <TabsContent value="individual" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(['basic', 'pro', 'enterprise'] as UserPlan[]).map((planName) => {
                const planInfo = planData[planName];
                const isCurrentPlan = plan === planName;
                const price = getPlanPrice(planName);
                const savings = savingsPercentage(planName);
                const monthlyEquivalent = getMonthlyEquivalent(planName);
                
                return (
                  <Card key={planName} className={`relative ${planInfo.highlight ? 'border-primary shadow-lg' : ''} h-full`}>
                    {planInfo.highlight && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-primary hover:bg-primary">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className={`${planInfo.highlight ? 'bg-primary/5' : ''} rounded-t-lg`}>
                      <CardTitle>{planInfo.title}</CardTitle>
                      <CardDescription>{planInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        {billingCycle === 'yearly' && price > 0 && (
                          <div>
                            <div className="text-sm text-muted-foreground mt-1">${monthlyEquivalent}/month when billed annually</div>
                            <div className="text-sm text-muted-foreground">Save {savings}% with annual billing</div>
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mt-6">
                        {planInfo.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 shrink-0" />
                            )}
                            <span className="flex items-center gap-1 text-sm">
                              {getFeatureIcon(feature.name)}
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      {subscribed ? (
                        isCurrentPlan ? (
                          <Button variant="secondary" disabled className="w-full">
                            {isLoading[planName] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            variant={planName === 'pro' ? 'default' : 'outline'}
                            onClick={() => handleSubscribe(planName)} 
                            disabled={isLoading[planName]} 
                            className="w-full"
                          >
                            {isLoading[planName] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              `Upgrade to ${planInfo.title}`
                            )}
                          </Button>
                        )
                      ) : (
                        <Button 
                          onClick={() => handleSubscribe(planName)} 
                          disabled={isLoading[planName]} 
                          variant={planInfo.highlight ? 'default' : 'outline'}
                          className="w-full"
                          size="lg"
                        >
                          {isLoading[planName] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            'Subscribe'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="agency" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {(['agency-small', 'agency-medium', 'agency-large'] as UserPlan[]).map((planName) => {
                const planInfo = planData[planName];
                const isCurrentPlan = plan === planName;
                const price = getPlanPrice(planName);
                const savings = savingsPercentage(planName);
                const setupFee = PLAN_DETAILS[planName].pricing.setupFee;
                const monthlyEquivalent = getMonthlyEquivalent(planName);
                
                return (
                  <Card key={planName} className="relative h-full">
                    <CardHeader>
                      <CardTitle>{planInfo.title}</CardTitle>
                      <CardDescription>{planInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        {setupFee && (
                          <div className="text-sm text-muted-foreground mt-1">
                            + ${setupFee} one-time setup fee
                          </div>
                        )}
                        {billingCycle === 'yearly' && (
                          <div>
                            <div className="text-sm text-muted-foreground mt-1">${monthlyEquivalent}/month when billed annually</div>
                            <div className="text-sm text-muted-foreground">Save {savings}% with annual billing</div>
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mt-6">
                        {planInfo.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 shrink-0" />
                            )}
                            <span className="flex items-center gap-1 text-sm">
                              {getFeatureIcon(feature.name)}
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      {subscribed ? (
                        isCurrentPlan ? (
                          <Button variant="secondary" disabled className="w-full">
                            {isLoading[planName] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => handleSubscribe(planName)} 
                            disabled={isLoading[planName]} 
                            className="w-full"
                            size="lg"
                          >
                            {isLoading[planName] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : `Upgrade to ${planInfo.title}`}
                          </Button>
                        )
                      ) : (
                        <Button 
                          onClick={() => handleSubscribe(planName)} 
                          disabled={isLoading[planName]} 
                          className="w-full"
                          size="lg"
                        >
                          {isLoading[planName] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : 'Subscribe'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Custom Plan Contact Section */}
      <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a Custom Plan?</h2>
        <p className="mb-6 max-w-xl mx-auto">
          For enterprises or agencies with specific requirements, contact our sales team for a tailored solution that fits your unique needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" variant="outline" onClick={() => window.location.href = 'mailto:sales@flaresync.com'}>
            Email Sales Team
          </Button>
          <Button size="lg">
            Schedule Consultation
          </Button>
        </div>
      </div>
      
      {/* Subscription Management */}
      {subscribed && (
        <div className="mt-12 border rounded-md p-6 bg-muted/50">
          <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
          <p>
            You are currently subscribed to the <strong className="capitalize">{plan.replace('-', ' ')}</strong> plan.
          </p>
          {currentPeriodEnd && (
            <p className="mb-4">
              Your subscription will renew on <strong>{formatDate(currentPeriodEnd)}</strong>.
            </p>
          )}
          <div className="mt-4 flex gap-3">
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
      
      {/* Feature Access Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Plan Features Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-4 text-left">Feature</th>
                <th className="p-4 text-center">Basic</th>
                <th className="p-4 text-center">Pro</th>
                <th className="p-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">Posts per month</td>
                <td className="p-4 text-center">30</td>
                <td className="p-4 text-center">120</td>
                <td className="p-4 text-center">500</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Social media accounts</td>
                <td className="p-4 text-center">2</td>
                <td className="p-4 text-center">5</td>
                <td className="p-4 text-center">10</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Team members</td>
                <td className="p-4 text-center">1</td>
                <td className="p-4 text-center">3</td>
                <td className="p-4 text-center">10</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Analytics</td>
                <td className="p-4 text-center">Basic</td>
                <td className="p-4 text-center">Advanced</td>
                <td className="p-4 text-center">Advanced</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Caption generation</td>
                <td className="p-4 text-center">5/month</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">AI content recommendations</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Engagement predictions</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b">
                <td className="p-4">Automated scheduling</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b">
                <td className="p-4">API access</td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                <td className="p-4 text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-bold mb-2">How do I change my plan?</h3>
            <p className="text-muted-foreground">
              You can upgrade or downgrade your plan at any time through the Manage Subscription button if you're already a subscriber.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-bold mb-2">Are there any setup fees?</h3>
            <p className="text-muted-foreground">
              Individual plans have no setup fees. Agency plans include a one-time setup fee to cover onboarding, account configuration, and team training.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards including Visa, Mastercard, American Express, and Discover.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
