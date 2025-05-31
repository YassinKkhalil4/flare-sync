
import React, { useEffect } from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Activity,
  AlertCircle,
  TrendingUp,
  UserCheck,
  DollarSign,
  MessageSquare
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { permissions, isLoading: permissionsLoading } = useAdminPermissions();
  const { isAdmin, adminTier, userRole, isLoading: roleLoading } = useUserRole();
  const { user } = useAuth();

  useEffect(() => {
    console.log('AdminDashboard - Debug Info:', {
      user: user?.id,
      userEmail: user?.email,
      isAdmin,
      adminTier,
      userRole,
      permissions,
      permissionsLoading,
      roleLoading
    });
  }, [user, isAdmin, adminTier, userRole, permissions, permissionsLoading, roleLoading]);

  const isLoading = permissionsLoading || roleLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access the admin dashboard.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                  <p className="font-semibold mb-2">Debug Info:</p>
                  <p>Email: {user?.email}</p>
                  <p>User ID: {user?.id}</p>
                  <p>User Role: {userRole || 'null'}</p>
                  <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                  <p>Admin Tier: {adminTier || 'null'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '892',
      change: '+5%',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'Content Posts',
      value: '5,678',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your FlareSync platform</p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              {adminTier?.charAt(0).toUpperCase() + adminTier?.slice(1)} Admin
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-green-600">{stat.change}</p>
                      </div>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Tabs */}
        <Card>
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-14">
                <TabsTrigger value="overview" className="h-12">
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  disabled={!permissions?.can_manage_users}
                  className="h-12"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  disabled={!permissions?.can_manage_content}
                  className="h-12"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  disabled={!permissions?.can_access_billing}
                  className="h-12"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Platform Overview</h3>
                  <p className="text-muted-foreground">
                    Monitor key platform metrics and system health
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">New user registrations</span>
                          <span className="text-sm font-medium">+24 today</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Posts published</span>
                          <span className="text-sm font-medium">156 today</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Support tickets</span>
                          <span className="text-sm font-medium">3 open</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Database</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API Status</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Storage</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="p-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  Advanced user management tools will be implemented here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Content Management</h3>
                <p className="text-muted-foreground">
                  Content moderation and management tools will be available here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="p-6">
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Billing Management</h3>
                <p className="text-muted-foreground">
                  Revenue tracking and billing management tools will be implemented here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
