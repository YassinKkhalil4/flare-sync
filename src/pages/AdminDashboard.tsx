import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { adminService, useAdmin, AdminPermission } from '@/services/adminService';
import {
  Users,
  MessageSquare,
  Instagram,
  Search,
  UserCheck,
  UserX,
  Trash2,
  PieChart,
  Settings,
  AlertCircle,
  Loader2,
  Shield,
  UserPlus,
} from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Admin user interface
interface AdminUser {
  id: string;
  email?: string;
  full_name?: string;
  permissions: AdminPermission[];
}

// User profile interface
interface ExtendedProfile {
  avatar_url?: string;
  created_at: string;
  full_name?: string;
  id: string;
  updated_at?: string;
  username?: string;
  suspended?: boolean;
  role?: 'creator' | 'brand' | 'admin';
  plan?: 'free' | 'basic' | 'pro';
  email?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, createAdminUser, getAdminPermissions, getAllAdmins } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPermissions, setUserPermissions] = useState<AdminPermission[]>([]);

  const [adminPermissions, setAdminPermissions] = useState<Record<string, boolean>>({
    users_manage: false,
    content_manage: false,
    social_manage: false,
    conversations_manage: false,
    analytics_view: false,
    admins_manage: false
  });
  
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  
  // Fetch user's admin permissions
  useEffect(() => {
    const fetchAdminPermissions = async () => {
      if (!user?.id) return;
      
      try {
        const permissions = await getAdminPermissions();
        setUserPermissions(permissions);
      } catch (error) {
        console.error('Error fetching admin permissions:', error);
      }
    };
    
    fetchAdminPermissions();
  }, [user, getAdminPermissions]);
  
  // Check if user has specific permission
  const hasPermission = (permission: AdminPermission): boolean => {
    return userPermissions.includes(permission);
  };
  
  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Check admin status first
        const adminCheck = await isAdmin();
        if (!adminCheck) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to view the admin dashboard.',
            variant: 'destructive',
          });
          return;
        }

        // Fetch users if has permission
        if (hasPermission('users_manage')) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*');
            
          if (userError) throw userError;
          setUsers(userData as ExtendedProfile[] || []);
        }
        
        // Fetch admin users if has permission
        if (hasPermission('admins_manage')) {
          const admins = await getAllAdmins();
          if (admins) {
            setAdminUsers(admins as AdminUser[]);
          }
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: 'Error loading admin data',
          description: 'Please try again or contact support.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, [toast, isAdmin, hasPermission, getAllAdmins]);

  // Handle user suspension
  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ suspended: true })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, suspended: true } : user
      ));

      toast({
        title: 'User Suspended',
        description: 'User account has been suspended.',
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend user.',
        variant: 'destructive',
      });
    }
  };

  // Handle user restoration
  const handleRestoreUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ suspended: false })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, suspended: false } : user
      ));

      toast({
        title: 'User Restored',
        description: 'User account has been restored.',
      });
    } catch (error) {
      console.error('Error restoring user:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore user.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      // Validate form
      if (!newAdminForm.email || !newAdminForm.password) {
        throw new Error('Email and password are required');
      }
      
      if (newAdminForm.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Get selected permissions
      const selectedPermissions = Object.entries(adminPermissions)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([permission]) => permission as AdminPermission);
      
      // Create admin user
      const success = await createAdminUser(
        newAdminForm.email,
        newAdminForm.password,
        newAdminForm.full_name || '',
        selectedPermissions
      );
      
      if (!success) {
        throw new Error('Failed to create admin user');
      }
      
      // Reset form
      setNewAdminForm({
        email: '',
        password: '',
        full_name: '',
      });
      
      setAdminPermissions({
        users_manage: false,
        content_manage: false,
        social_manage: false,
        conversations_manage: false,
        analytics_view: false,
        admins_manage: false
      });
      
      // Refresh admin users list
      const admins = await getAllAdmins();
      if (admins) {
        setAdminUsers(admins as AdminUser[]);
      }
      
      toast({
        title: 'Admin Created',
        description: `Successfully created admin user ${newAdminForm.email}`,
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Failed to create admin',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading Admin Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage users, conversations, and platform data</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${hasPermission('admins_manage') ? 5 : 4}, 1fr)` }}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {hasPermission('users_manage') && <TabsTrigger value="users">Users</TabsTrigger>}
          {hasPermission('conversations_manage') && <TabsTrigger value="conversations">Conversations</TabsTrigger>}
          {hasPermission('social_manage') && <TabsTrigger value="social">Social</TabsTrigger>}
          {hasPermission('admins_manage') && <TabsTrigger value="admins">Admins</TabsTrigger>}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.role === 'creator').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Brands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.role === 'brand').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminUsers.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Admin Permissions</CardTitle>
                <CardDescription>These are the permissions assigned to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userPermissions.map(permission => (
                    <div key={permission} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {permission.replace('_', ' ')}
                    </div>
                  ))}
                  {userPermissions.length === 0 && (
                    <p className="text-muted-foreground">No specific permissions assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Quick actions for platform management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {hasPermission('users_manage') && (
                    <Button variant="outline" onClick={() => setActiveTab('users')}>
                      <Users className="w-4 h-4 mr-2" /> Manage Users
                    </Button>
                  )}
                  
                  {hasPermission('admins_manage') && (
                    <Button variant="outline" onClick={() => setActiveTab('admins')}>
                      <Shield className="w-4 h-4 mr-2" /> Manage Admins
                    </Button>
                  )}
                  
                  {hasPermission('social_manage') && (
                    <Button variant="outline" onClick={() => setActiveTab('social')}>
                      <Instagram className="w-4 h-4 mr-2" /> Social Accounts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          {hasPermission('users_manage') ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(user => {
                          if (!searchQuery) return true;
                          return (
                            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.username?.toLowerCase().includes(searchQuery.toLowerCase())
                          );
                        })
                        .map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || ''} />
                                  <AvatarFallback>
                                    {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span>{user.full_name || user.username || 'Unknown'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span className="capitalize">{user.role || 'user'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{user.plan || 'free'}</span>
                            </TableCell>
                            <TableCell>
                              {user.suspended ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {user.suspended ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleRestoreUser(user.id)}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleSuspendUser(user.id)}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-amber-800">Access Restricted</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">You do not have permission to manage users.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Conversations Tab */}
        <TabsContent value="conversations" className="mt-6">
          {hasPermission('conversations_manage') ? (
            <Card>
              <CardHeader>
                <CardTitle>Conversations Management</CardTitle>
                <CardDescription>View and manage user conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Conversation management features will be implemented here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-amber-800">Access Restricted</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">You do not have permission to manage conversations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Social Tab */}
        <TabsContent value="social" className="mt-6">
          {hasPermission('social_manage') ? (
            <Card>
              <CardHeader>
                <CardTitle>Social Connections</CardTitle>
                <CardDescription>Manage social media connections and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Social connections management features will be implemented here.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-amber-800">Access Restricted</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">You do not have permission to manage social connections.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Admins Tab */}
        <TabsContent value="admins" className="mt-6">
          {hasPermission('admins_manage') ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Creation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Admin</CardTitle>
                  <CardDescription>Add new admin users with custom permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="admin@example.com" 
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-fullname">Full Name</Label>
                    <Input 
                      id="admin-fullname" 
                      type="text" 
                      placeholder="John Doe" 
                      value={newAdminForm.full_name}
                      onChange={(e) => setNewAdminForm({...newAdminForm, full_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Permissions</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="users-manage" 
                          checked={adminPermissions.users_manage}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, users_manage: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="users-manage" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Manage Users
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="content-manage" 
                          checked={adminPermissions.content_manage}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, content_manage: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="content-manage" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Manage Content
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="social-manage" 
                          checked={adminPermissions.social_manage}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, social_manage: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="social-manage" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Manage Social Connections
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="conversations-manage" 
                          checked={adminPermissions.conversations_manage}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, conversations_manage: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="conversations-manage" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Manage Conversations
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="analytics-view" 
                          checked={adminPermissions.analytics_view}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, analytics_view: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="analytics-view" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          View Analytics
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admins-manage" 
                          checked={adminPermissions.admins_manage}
                          onCheckedChange={(checked) => {
                            setAdminPermissions({...adminPermissions, admins_manage: checked === true}); 
                          }} 
                        />
                        <label 
                          htmlFor="admins-manage" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Manage Admins
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateAdmin}
                    disabled={isLoading || !newAdminForm.email || !newAdminForm.password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Admin
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Existing Admins Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>View and manage admin accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{admin.full_name || 'Unnamed Admin'}</span>
                              <span className="text-sm text-muted-foreground">{admin.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {admin.permissions.map(permission => (
                                <span 
                                  key={permission} 
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                >
                                  {permission.replace('_', ' ')}
                                </span>
                              ))}
                              {admin.permissions.length === 0 && (
                                <span className="text-muted-foreground text-xs">No permissions</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={admin.id === user?.id}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {adminUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No admin users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-amber-800">Access Restricted</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">You do not have permission to manage admins.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
