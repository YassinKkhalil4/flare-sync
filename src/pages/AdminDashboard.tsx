
import React from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Activity,
  AlertCircle,
  Shield
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { permissions, isLoading } = useAdminPermissions();
  const { isAdmin } = useUserRole();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: CreditCard,
      color: 'text-green-500'
    },
    {
      title: 'Content Posts',
      value: '5,678',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      title: 'Active Sessions',
      value: '892',
      change: '+5%',
      icon: Activity,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your FlareSync platform</p>
        </div>
        <Badge variant="default" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Administrator
        </Badge>
      </div>

      {/* Stats Overview */}
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
                    <p className="text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" disabled={!permissions?.can_manage_users}>
            Users
          </TabsTrigger>
          <TabsTrigger value="content" disabled={!permissions?.can_manage_content}>
            Content
          </TabsTrigger>
          <TabsTrigger value="billing" disabled={!permissions?.can_access_billing}>
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={!permissions?.can_manage_plans}>
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground">
                  User management features will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Monitor and manage platform content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Content Overview</h3>
                <p className="text-muted-foreground">
                  Content management features will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Revenue</CardTitle>
              <CardDescription>
                Monitor platform revenue and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Revenue Dashboard</h3>
                <p className="text-muted-foreground">
                  Billing and revenue features will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">System Configuration</h3>
                <p className="text-muted-foreground">
                  Platform settings will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
