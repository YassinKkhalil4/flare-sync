
import React from 'react';
import { useRealDeals } from '@/hooks/useRealDeals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  HandHeart, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Building2 
} from 'lucide-react';
import { format } from 'date-fns';

const BrandDeals: React.FC = () => {
  const { userRole } = useUserRole();
  const { deals, isLoading, createDeal, respondToDeal } = useRealDeals();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading deals...</div>
      </div>
    );
  }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const pendingDeals = deals.filter(deal => deal.status === 'pending');
  const activeDeals = deals.filter(deal => deal.status === 'accepted');
  const completedDeals = deals.filter(deal => deal.status === 'completed');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HandHeart className="h-8 w-8" />
            Brand Partnerships
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'creator' 
              ? 'Manage collaboration opportunities with brands'
              : 'Find and partner with talented creators'
            }
          </p>
        </div>
        {userRole === 'brand' && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Deal
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                completedDeals.reduce((sum, deal) => sum + deal.budget, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deals */}
      {pendingDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Deals ({pendingDeals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDeals.map((deal) => (
                <div key={deal.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {deal.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {deal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(deal.budget)}
                        </span>
                        {deal.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {format(new Date(deal.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        From {deal.brand_name} • {format(new Date(deal.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    {getStatusBadge(deal.status)}
                  </div>

                  {deal.requirements && deal.requirements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {deal.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {deal.deliverables && deal.deliverables.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Deliverables:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {deal.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {userRole === 'creator' && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => respondToDeal(deal.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept Deal
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToDeal(deal.id, 'rejected')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Active Deals ({activeDeals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDeals.map((deal) => (
                <div key={deal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{deal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {deal.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(deal.budget)}
                        </span>
                        {deal.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due {format(new Date(deal.deadline), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(deal.status)}
                      <Button
                        size="sm"
                        onClick={() => respondToDeal(deal.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Deals Empty State */}
      {deals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No deals yet</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === 'creator' 
                ? 'Brands will send you collaboration opportunities here'
                : 'Start creating deals to partner with creators'
              }
            </p>
            {userRole === 'brand' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandDeals;
