
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
            // Make sure deal.profiles exists and handle it safely
            let brandName = 'Unknown Brand';
            let brandLogo = '';
            
            if (deal.profiles !== null && 
                deal.profiles !== undefined && 
                typeof deal.profiles === 'object') {
              // Now TypeScript knows deal.profiles is a non-null object
              brandName = 'name' in deal.profiles ? String(deal.profiles.name) : 'Unknown Brand';
              brandLogo = 'avatar_url' in deal.profiles ? String(deal.profiles.avatar_url) : '';
            }
            
            // Ensure status is one of the allowed literal types
            const dealStatus = ['pending', 'accepted', 'rejected', 'completed'].includes(deal.status) 
              ? deal.status as 'pending' | 'accepted' | 'rejected' | 'completed'
              : 'pending';
            
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
