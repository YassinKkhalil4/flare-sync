import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DealsAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Calendar, DollarSign } from 'lucide-react';

// Define the Deal interface based on the service
interface BrandDeal {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  creator_id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements: string[];
  deliverables: string[];
  deadline: string;
  created_at: string;
}

const BrandDeals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<BrandDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const userType = user?.role || 'creator';

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const dealsData = await DealsAPI.getDeals(userType as 'creator' | 'brand');
        setDeals(dealsData);
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brand deals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [user, userType, toast]);

  const handleStatusUpdate = async (dealId: string, status: 'accepted' | 'rejected' | 'completed') => {
    setActionInProgress({...actionInProgress, [dealId]: true});
    try {
      const updatedDeal = await DealsAPI.updateDealStatus(dealId, status);
      
      // Update local state
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === dealId ? {...deal, status} : deal
        )
      );
      
      toast({
        title: 'Status updated',
        description: `The deal has been ${status}.`,
      });
    } catch (error) {
      console.error('Error updating deal status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update deal status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress({...actionInProgress, [dealId]: false});
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Brand Collaborations</h1>
      
      {deals.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">No brand deals found</p>
            {userType === 'brand' && (
              <p className="text-sm">Create a new deal to collaborate with creators</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {deals.map(deal => (
            <Card key={deal.id} className={`border ${deal.status === 'accepted' ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      <img 
                        src={deal.brand_logo} 
                        alt={deal.brand_name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle>{deal.title}</CardTitle>
                      <CardDescription>
                        {userType === 'creator' ? `From ${deal.brand_name}` : 'For creators'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <Badge 
                    className={`
                      ${deal.status === 'pending' ? 'bg-yellow-500' : ''}
                      ${deal.status === 'accepted' ? 'bg-green-500' : ''}
                      ${deal.status === 'rejected' ? 'bg-red-500' : ''}
                      ${deal.status === 'completed' ? 'bg-blue-500' : ''}
                    `}
                  >
                    {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{deal.description}</p>
                
                <div className="flex flex-wrap gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Budget
                    </h4>
                    <p className="text-lg font-bold">{formatCurrency(deal.budget)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Deadline
                    </h4>
                    <p>{formatDate(deal.deadline)}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {deal.requirements.map((req, i) => (
                        <li key={i} className="text-sm">{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Deliverables</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {deal.deliverables.map((deliv, i) => (
                        <li key={i} className="text-sm">{deliv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              
              {userType === 'creator' && deal.status === 'pending' && (
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(deal.id, 'rejected')}
                    disabled={actionInProgress[deal.id]}
                  >
                    {actionInProgress[deal.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(deal.id, 'accepted')}
                    disabled={actionInProgress[deal.id]}
                  >
                    {actionInProgress[deal.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </CardFooter>
              )}
              
              {userType === 'creator' && deal.status === 'accepted' && (
                <CardFooter>
                  <Button
                    onClick={() => handleStatusUpdate(deal.id, 'completed')}
                    disabled={actionInProgress[deal.id]}
                    className="ml-auto"
                  >
                    {actionInProgress[deal.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Mark as Completed
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandDeals;
