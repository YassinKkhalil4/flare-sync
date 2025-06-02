
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRealDeals } from '@/hooks/useRealDeals';
import { Card, CardContent } from '@/components/ui/card';
import { BrandDealCard } from '@/components/BrandDeals/BrandDealCard';
import { DealsLoading } from '@/components/BrandDeals/DealsLoading';
import { useUserRole } from '@/hooks/useUserRole';

const BrandDeals = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { deals, isLoading, respondToDeal } = useRealDeals();

  const handleStatusUpdate = async (dealId: string, status: 'accepted' | 'rejected' | 'completed') => {
    respondToDeal({ dealId, status });
  };

  if (isLoading) {
    return <DealsLoading />;
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Brand Collaborations</h1>
        {!deals || deals.length === 0 ? (
          <Card className="bg-muted/50 w-full">
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">No brand deals found</p>
              {userRole === 'brand' && (
                <p className="text-xs sm:text-sm">Create a new deal to collaborate with creators</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:gap-6">
            {deals.map(deal => {
              const profiles = deal.profiles as { full_name?: string; avatar_url?: string } | null;
              const brandName = profiles?.full_name || 'Unknown Brand';
              const brandLogo = profiles?.avatar_url || '';
              
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
                  userType={userRole || 'creator'}
                  actionInProgress={false}
                  onStatusUpdate={handleStatusUpdate}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDeals;
