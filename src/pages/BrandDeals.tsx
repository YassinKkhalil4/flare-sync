import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RealDealsService } from '@/services/realDealsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BrandDeal {
  id: string;
  creator_id: string;
  brand_id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  brand_name?: string;
  creator_name?: string;
}

const BrandDeals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['brand-deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await RealDealsService.getUserDeals(user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const updateDealMutation = useMutation({
    mutationFn: ({ dealId, status }: { dealId: string; status: 'accepted' | 'rejected' | 'completed' }) =>
      RealDealsService.updateDealStatus(dealId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-deals'] });
      toast({
        title: 'Success',
        description: 'Deal status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update deal status',
        variant: 'destructive',
      });
    },
  });

  const handleAcceptDeal = (dealId: string) => {
    updateDealMutation.mutate({ dealId, status: 'accepted' });
  };

  const handleRejectDeal = (dealId: string) => {
    updateDealMutation.mutate({ dealId, status: 'rejected' });
  };

  const handleCompleteDeal = (dealId: string) => {
    updateDealMutation.mutate({ dealId, status: 'completed' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Brand Deals</h1>
      {deals.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No deals available</p>
              <p className="text-muted-foreground">Check back later for new opportunities.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">{deal.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {deal.brand_name || 'Unknown Brand'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 line-clamp-3">{deal.description}</p>
                <div className="flex items-center mt-3">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Budget: ${deal.budget}</span>
                </div>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Created: {format(new Date(deal.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="mt-3">{getStatusBadge(deal.status)}</div>
              </CardContent>
              <div className="flex justify-between p-4 border-t border-gray-200">
                {deal.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptDeal(deal.id)}
                      disabled={updateDealMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectDeal(deal.id)}
                      disabled={updateDealMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {deal.status === 'accepted' && (
                  <Button
                    size="sm"
                    onClick={() => handleCompleteDeal(deal.id)}
                    disabled={updateDealMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Mark as Complete
                  </Button>
                )}
                {deal.status === 'completed' && (
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                )}
                {deal.status === 'rejected' && (
                  <span className="text-sm text-red-600 font-medium">Rejected</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandDeals;
