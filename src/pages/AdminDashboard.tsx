import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { MessagingService, SocialService } from '../services/api';
import { supabase } from '../integrations/supabase/client';
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
} from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Mock data interfaces for when the tables don't exist yet
interface MockConversation {
  id: string;
  partner_name: string;
  partner_type: 'brand' | 'creator';
  partner_avatar?: string;
  created_at: string;
}

interface MockSocialProfile {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  connected: boolean;
  last_synced?: string;
}

interface ExtendedProfile {
  avatar_url: string;
  created_at: string;
  full_name: string;
  id: string;
  updated_at: string;
  username: string;
  suspended?: boolean;
  role?: 'creator' | 'brand' | 'admin';
  plan?: 'free' | 'basic' | 'pro';
  email?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [conversations, setConversations] = useState<MockConversation[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<MockSocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*');
          
        if (userError) throw userError;
        
        // Use mock data for conversations since the table might not exist yet
        const mockConversations: MockConversation[] = [
          {
            id: '1',
            partner_name: 'Brand Company',
            partner_type: 'brand',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            partner_name: 'Creator John',
            partner_type: 'creator',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        // Use mock data for social profiles since the table might not exist yet
        const mockSocialProfiles: MockSocialProfile[] = [
          {
            id: '1',
            user_id: '1',
            platform: 'instagram',
            username: 'creator123',
            connected: true,
            last_synced: new Date().toISOString()
          },
          {
            id: '2',
            user_id: '2',
            platform: 'tiktok',
            username: 'tiktokuser',
            connected: false
          }
        ];
        
        setUsers(userData as ExtendedProfile[] || []);
        setConversations(mockConversations);
        setSocialProfiles(mockSocialProfiles);
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
  }, [toast]);
  
  const handleSuspendUser = async (userId: string) => {
    try {
      // In a real implementation, we would update the suspended status in the database
      setUsers(users.map(u => u.id === userId ? {...u, suspended: true} : u));
      
      toast({
        title: 'User suspended',
        description: 'User has been suspended successfully.',
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: 'Could not suspend user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRestoreUser = async (userId: string) => {
    try {
      // In a real implementation, we would update the suspended status in the database
      setUsers(users.map(u => u.id === userId ? {...u, suspended: false} : u));
      
      toast({
        title: 'User restored',
        description: 'User has been restored successfully.',
      });
    } catch (error) {
      console.error('Error restoring user:', error);
      toast({
        title: 'Error',
        description: 'Could not restore user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // In a real implementation, we would delete the conversation from the database
      setConversations(conversations.filter(c => c.id !== conversationId));
      
      toast({
        title: 'Conversation deleted',
        description: 'Conversation and all its messages have been deleted.',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not delete conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
      
      <div className="flex justify-between mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="social">Social Connections</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {users.filter(u => u.suspended).length} suspended
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{conversations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active message threads
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {socialProfiles.filter(p => p.connected).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instagram connections
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Overview of the latest platform activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="text-sm">
                          New user registration: <span className="font-medium">user123@email.com</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Date.now() - i * 3600000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
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
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(u => 
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${user.full_name}`} />
                                <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <span>{user.full_name || 'Anonymous'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.suspended ? 'Suspended' : 'Active'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.suspended ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                                onClick={() => handleRestoreUser(user.id)}
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Restore</span>
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 text-red-500 hover:text-red-600"
                                onClick={() => handleSuspendUser(user.id)}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>Message Threads</CardTitle>
                <CardDescription>Manage conversations between users and brands</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Conversation</TableHead>
                      <TableHead>Partners</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conversation, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={conversation.partner_avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${conversation.partner_name}`} />
                              <AvatarFallback>{conversation.partner_name?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <span>Thread #{conversation.id.substring(0, 8)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{conversation.partner_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {conversation.partner_type === 'brand' ? 'Brand' : 'Creator'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                            15 messages
                          </span>
                        </TableCell>
                        <TableCell>{new Date(conversation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteConversation(conversation.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Social Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Connected Social Accounts</CardTitle>
                <CardDescription>Management of platform integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialProfiles.map((profile, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {profile.platform === 'instagram' && (
                              <Instagram className="h-4 w-4 text-pink-500" />
                            )}
                            <span className="capitalize">{profile.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {users.find(u => u.id === profile.user_id)?.email || profile.user_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {profile.username}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            profile.connected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {profile.connected ? 'Connected' : 'Disconnected'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {profile.last_synced 
                            ? new Date(profile.last_synced).toLocaleString() 
                            : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-amber-800">Instagram API Limits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800 text-sm">
                    The Instagram Graph API has a rate limit of 200 requests per user per hour.
                    Current usage: 42/200 requests (21%)
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
