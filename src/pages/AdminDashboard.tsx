import React from 'react';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Activity,
  AlertCircle,
  Shield,
  TrendingUp,
  Database,
  LogOut
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { permissions, isLoading } = useAdminPermissions();
  const { isAdmin } = useUserRole();
  const { signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: CreditCard,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Content Posts',
      value: '5,678',
      change: '+8%',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Sessions',
      value: '892',
      change: '+5%',
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Monitor and manage your FlareSync platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="flex items-center gap-2 px-4 py-2 text-sm">
              <Shield className="h-4 w-4" />
              Administrator
            </Badge>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-green-600 font-medium">{stat.change} from last month</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Tabs */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="users" className="w-full">
            <div className="border-b bg-muted/30">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-16 p-2">
                <TabsTrigger 
                  value="users" 
                  disabled={!permissions?.can_manage_users}
                  className="h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  disabled={!permissions?.can_manage_content}
                  className="h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  disabled={!permissions?.can_access_billing}
                  className="h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  disabled={!permissions?.can_manage_plans}
                  className="h-12 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users" className="p-8 m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">User Management</h2>
                  <p className="text-muted-foreground">Manage user accounts and permissions across the platform</p>
                </div>
                <div className="text-center py-16">
                  <div className="rounded-full bg-muted p-6 mx-auto mb-6 w-fit">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">User Management Tools</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Advanced user management features will be implemented here to help you oversee platform users
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="p-8 m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Content Management</h2>
                  <p className="text-muted-foreground">Monitor and manage all content created on the platform</p>
                </div>
                <div className="text-center py-16">
                  <div className="rounded-full bg-muted p-6 mx-auto mb-6 w-fit">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Content Overview</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Content moderation and analytics tools will be available here to maintain platform quality
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="p-8 m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Billing & Revenue</h2>
                  <p className="text-muted-foreground">Track platform revenue and subscription analytics</p>
                </div>
                <div className="text-center py-16">
                  <div className="rounded-full bg-muted p-6 mx-auto mb-6 w-fit">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Revenue Dashboard</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Comprehensive billing analytics and revenue tracking tools will be implemented here
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-8 m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Platform Settings</h2>
                  <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
                </div>
                <div className="text-center py-16">
                  <div className="rounded-full bg-muted p-6 mx-auto mb-6 w-fit">
                    <Database className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">System Configuration</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Platform configuration tools and system settings will be available here for administrators
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
