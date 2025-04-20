
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dealsService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { BrandDealCard, BrandDeal } from '@/components/BrandDeals/BrandDealCard';
import { DealsLoading } from '@/components/BrandDeals/DealsLoading';

// Create a mapper function to convert DB deals to BrandDeal format
const mapDealsToBrandDeals = (deals: any[]): BrandDeal[] => {
  return deals.map(deal => ({
    id: deal.id,
    brand_id: deal.brand_id,
    brand_name: deal.profiles?.name || 'Unknown Brand',
    brand_logo: deal.profiles?.avatar_url || '',
    creator_id: deal.creator_id,
    title: deal.description?.substring(0, 50) || 'Untitled Deal',
    description: deal.description || '',
    budget: deal.price,
    status: deal.status,
    requirements: ['Content creation', 'Social media posting'],
    deliverables: ['One post per week', 'Monthly analytics report'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: deal.created_at
  }));
};

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
        const dealsData = await dealsService.getDeals();
        setDeals(mapDealsToBrandDeals(dealsData));
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
  }, [user, toast]);

  const handleStatusUpdate = async (dealId: string, status: 'accepted' | 'rejected' | 'completed') => {
    setActionInProgress({...actionInProgress, [dealId]: true});
    try {
      await dealsService.updateDealStatus(dealId, status);
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId ? { ...deal, status } : deal
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

  if (isLoading) {
    return <DealsLoading />;
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
            <BrandDealCard
              key={deal.id}
              deal={deal}
              userType={userType}
              actionInProgress={!!actionInProgress[deal.id]}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandDeals;

