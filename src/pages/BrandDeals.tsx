
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent } from '@/components/ui/card';
import { BrandDealCard } from '@/components/BrandDeals/BrandDealCard';
import { DealsLoading } from '@/components/BrandDeals/DealsLoading';

const BrandDeals = () => {
  const { user } = useAuth();
  const { deals, isLoading, respondToDeal } = useDeals();
  const userType = user?.role || 'creator';

  const handleStatusUpdate = async (dealId: string, status: 'accepted' | 'rejected' | 'completed') => {
    respondToDeal({ dealId, status });
  };

  if (isLoading) {
    return <DealsLoading />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Brand Collaborations</h1>
      {!deals || deals.length === 0 ? (
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
          {deals.map(deal => {
            // Handle the potential error type by using type guards
            const brandName = typeof deal.profiles === 'object' && deal.profiles ? deal.profiles.full_name || 'Unknown Brand' : 'Unknown Brand';
            const brandLogo = typeof deal.profiles === 'object' && deal.profiles ? deal.profiles.avatar_url || '' : '';
            
            const dealStatus = (['pending', 'accepted', 'rejected', 'completed'].includes(deal.status) 
              ? deal.status 
              : 'pending') as 'pending' | 'accepted' | 'rejected' | 'completed';
            
            return (
              <BrandDealCard
                key={deal.id}
                deal={{
                  id: deal.id,
                  brand_id: deal.brand_id,
                  brand_name: brandName,
                  brand_logo: brandLogo,
                  creator_id: deal.creator_id,
                  title: deal.description?.substring(0, 50) || 'Untitled Deal',
                  description: deal.description || '',
                  budget: deal.price,
                  status: dealStatus,
                  requirements: ['Content creation', 'Social media posting'],
                  deliverables: ['One post per week', 'Monthly analytics report'],
                  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  created_at: deal.created_at
                }}
                userType={userType}
                actionInProgress={false}
                onStatusUpdate={handleStatusUpdate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandDeals;
