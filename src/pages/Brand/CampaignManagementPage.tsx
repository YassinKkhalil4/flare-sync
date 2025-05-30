
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

// Mock data for campaigns
const mockCampaigns = [
  {
    id: '1',
    name: 'Summer Fitness Challenge',
    status: 'active',
    budget: 15000,
    spent: 8500,
    startDate: '2024-06-01',
    endDate: '2024-07-31',
    creators: 8,
    reach: 450000,
    engagement: 12500,
    conversions: 850
  },
  {
    id: '2',
    name: 'Tech Product Launch',
    status: 'planning',
    budget: 25000,
    spent: 0,
    startDate: '2024-07-15',
    endDate: '2024-08-15',
    creators: 12,
    reach: 0,
    engagement: 0,
    conversions: 0
  },
  {
    id: '3',
    name: 'Holiday Fashion Collection',
    status: 'completed',
    budget: 20000,
    spent: 19500,
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    creators: 15,
    reach: 890000,
    engagement: 28400,
    conversions: 2100
  }
];

export const CampaignManagementPage: React.FC = () => {
  const [campaigns] = useState(mockCampaigns);
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'planning': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Campaign Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your influencer campaigns, track performance, and analyze results.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">{formatCurrency(60000)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                    <p className="text-2xl font-bold">{formatNumber(1340000)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Creators</p>
                    <p className="text-2xl font-bold">35</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">{formatCurrency(campaign.budget)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creators</p>
                        <p className="font-medium">{campaign.creators}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reach</p>
                        <p className="font-medium">{formatNumber(campaign.reach)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="font-medium">{formatNumber(campaign.conversions)}</p>
                      </div>
                    </div>
                    
                    {campaign.status === 'active' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Budget Spent</span>
                          <span>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                        </div>
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.filter(c => c.status === 'active').length > 0 ? (
                <div className="space-y-4">
                  {campaigns.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{campaign.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <Progress value={65} className="mt-2" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Reach</p>
                          <p className="font-medium">{formatNumber(campaign.reach)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          <p className="font-medium">{formatNumber(campaign.engagement)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-600">+180%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No active campaigns found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignManagementPage;
