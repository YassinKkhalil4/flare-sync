
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRealDeals } from '@/hooks/useRealDeals';
import { useUserRole } from '@/hooks/useUserRole';
import { Handshake, DollarSign, Calendar, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const BrandDeals = () => {
  const { deals, isLoading, createDeal, respondToDeal } = useRealDeals();
  const { userRole } = useUserRole();
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    budget: 0,
    creator_id: '',
    requirements: [] as string[],
    deliverables: [] as string[]
  });

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.description || !newDeal.creator_id) return;
    
    await createDeal({
      ...newDeal,
      requirements: newDeal.requirements.filter(r => r.trim()),
      deliverables: newDeal.deliverables.filter(d => d.trim())
    });
    
    setNewDeal({
      title: '',
      description: '',
      budget: 0,
      creator_id: '',
      requirements: [],
      deliverables: []
    });
    setIsCreatingDeal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Deals</h1>
            <p className="text-muted-foreground">
              {userRole === 'brand' ? 'Manage your brand partnerships' : 'View and respond to brand opportunities'}
            </p>
          </div>

          {userRole === 'brand' && (
            <Button onClick={() => setIsCreatingDeal(true)}>
              <Handshake className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          )}
        </div>

        {isCreatingDeal && userRole === 'brand' && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Deal title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
              />
              <Textarea
                placeholder="Deal description"
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
              />
              <Input
                placeholder="Creator ID"
                value={newDeal.creator_id}
                onChange={(e) => setNewDeal({ ...newDeal, creator_id: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Budget"
                value={newDeal.budget}
                onChange={(e) => setNewDeal({ ...newDeal, budget: Number(e.target.value) })}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateDeal}>Create Deal</Button>
                <Button variant="outline" onClick={() => setIsCreatingDeal(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : deals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No deals yet</h3>
                <p className="text-muted-foreground">
                  {userRole === 'brand' 
                    ? 'Create your first brand deal to start collaborating with creators'
                    : 'Brand deals will appear here when you receive offers'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            deals.map((deal) => (
              <Card key={deal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {deal.title}
                        <Badge className={getStatusColor(deal.status)}>
                          {deal.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deal.brand_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(deal.budget)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{deal.description}</p>
                  
                  {deal.requirements && deal.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {deal.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {deal.deliverables && deal.deliverables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Deliverables:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {deal.deliverables.map((deliverable, index) => (
                          <li key={index}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {deal.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      Deadline: {new Date(deal.deadline).toLocaleDateString()}
                    </div>
                  )}

                  {userRole === 'creator' && deal.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => respondToDeal({ dealId: deal.id, status: 'accepted' })}
                      >
                        Accept Deal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => respondToDeal({ dealId: deal.id, status: 'rejected' })}
                      >
                        Decline
                      </Button>
                    </div>
                  )}

                  {deal.status === 'accepted' && (
                    <div className="pt-4 border-t">
                      <Button 
                        size="sm"
                        onClick={() => respondToDeal({ dealId: deal.id, status: 'completed' })}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BrandDeals;
