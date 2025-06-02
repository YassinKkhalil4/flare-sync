
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, MessageSquare, DollarSign, TrendingUp, Activity } from 'lucide-react';

const AdminAnalytics = () => {
  // Fetch platform analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      // Get user counts by role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role');

      // Get content posts count
      const { data: posts } = await supabase
        .from('content_posts')
        .select('id, created_at, status');

      // Get deals count
      const { data: deals } = await supabase
        .from('deals')
        .select('id, created_at, status, price');

      // Get notifications count
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id, created_at, type');

      const roleDistribution = userRoles?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalRevenue = deals?.reduce((sum, deal) => sum + Number(deal.price), 0) || 0;

      return {
        userCounts: {
          total: userRoles?.length || 0,
          creators: roleDistribution.creator || 0,
          brands: roleDistribution.brand || 0,
          admins: Object.keys(roleDistribution).filter(role => role.includes('admin')).reduce((sum, role) => sum + roleDistribution[role], 0)
        },
        contentStats: {
          totalPosts: posts?.length || 0,
          published: posts?.filter(p => p.status === 'published').length || 0,
          scheduled: posts?.filter(p => p.status === 'scheduled').length || 0,
          draft: posts?.filter(p => p.status === 'draft').length || 0
        },
        dealStats: {
          totalDeals: deals?.length || 0,
          totalRevenue,
          pending: deals?.filter(d => d.status === 'pending').length || 0,
          accepted: deals?.filter(d => d.status === 'accepted').length || 0
        },
        notificationStats: {
          total: notifications?.length || 0,
          byType: notifications?.reduce((acc, { type }) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        }
      };
    }
  });

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userDistributionData = [
    { name: 'Creators', value: analyticsData?.userCounts.creators || 0 },
    { name: 'Brands', value: analyticsData?.userCounts.brands || 0 },
    { name: 'Admins', value: analyticsData?.userCounts.admins || 0 }
  ];

  const contentStatusData = [
    { name: 'Published', count: analyticsData?.contentStats.published || 0 },
    { name: 'Scheduled', count: analyticsData?.contentStats.scheduled || 0 },
    { name: 'Draft', count: analyticsData?.contentStats.draft || 0 }
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.userCounts.total || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.contentStats.totalPosts || 0}</div>
              <p className="text-xs text-muted-foreground">Total posts created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData?.dealStats.totalRevenue?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">From completed deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.dealStats.totalDeals || 0}</div>
              <p className="text-xs text-muted-foreground">Brand collaborations</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Status</CardTitle>
              <CardDescription>Posts by status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
