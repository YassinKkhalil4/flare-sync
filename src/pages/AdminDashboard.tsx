
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessagingService, SocialService } from '../services/api';
import { Conversation, SocialProfile } from '../types/messaging';
import { BarChart, Users, Activity, MessageSquare, Loader2, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '../utils/mockMessagingData';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch conversations
      setIsLoadingConversations(true);
      try {
        const conversationsData = await MessagingService.getConversations();
        setConversations(conversationsData);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingConversations(false);
      }

      // Fetch social profiles
      setIsLoadingSocial(true);
      try {
        const profilesData = await SocialService.getProfiles();
        setSocialProfiles(profilesData);
      } catch (error) {
        console.error('Failed to fetch social profiles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load social media data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSocial(false);
      }
    };

    fetchData();
  }, [toast]);

  // Count unread messages
  const unreadCount = conversations.filter(c => !c.lastMessage.read).length;
  
  // Get Instagram stats
  const instagramProfile = socialProfiles.find(p => p.platform === 'instagram');

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingConversations ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : conversations.length}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unread Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingConversations ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : unreadCount}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Connected Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingSocial ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : socialProfiles.filter(p => p.connected).length}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Instagram Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {isLoadingSocial || !instagramProfile?.stats ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : instagramProfile.stats.followers.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {isLoadingConversations ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 pb-2 border-b">Recent Messages</h3>
                      {conversations.length > 0 ? (
                        <div className="space-y-3">
                          {conversations.slice(0, 3).map(conversation => (
                            <div key={conversation.id} className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={conversation.partner.avatar} />
                                <AvatarFallback>{conversation.partner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{conversation.partner.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage.content}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(conversation.lastMessage.timestamp).split(',')[0]}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent messages</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 pb-2 border-b">Social Media Activity</h3>
                      {socialProfiles.some(p => p.connected) ? (
                        <div className="space-y-3">
                          {socialProfiles
                            .filter(p => p.connected)
                            .map(profile => (
                              <div key={profile.id} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  {profile.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium capitalize">{profile.platform}</p>
                                  <p className="text-sm text-muted-foreground">
                                    @{profile.username}
                                  </p>
                                </div>
                                {profile.lastSynced && (
                                  <div className="text-xs text-muted-foreground">
                                    Last synced: {new Date(profile.lastSynced).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No connected social platforms</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messaging Overview</CardTitle>
              <CardDescription>
                Monitor and manage conversations with brands and creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingConversations ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-semibold">All Conversations</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-3">Partner</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-left p-3">Last Message</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {conversations.map(conversation => (
                          <tr key={conversation.id} className="hover:bg-muted/50">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={conversation.partner.avatar} />
                                  <AvatarFallback>{conversation.partner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{conversation.partner.name}</span>
                              </div>
                            </td>
                            <td className="p-3 capitalize">{conversation.partner.type}</td>
                            <td className="p-3 truncate max-w-[200px]">{conversation.lastMessage.content}</td>
                            <td className="p-3">{formatDate(conversation.lastMessage.timestamp)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                conversation.lastMessage.read ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {conversation.lastMessage.read ? 'Read' : 'Unread'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Accounts</CardTitle>
              <CardDescription>
                Manage your connected social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSocial ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {socialProfiles.length > 0 ? (
                    socialProfiles.map(profile => (
                      <Card key={profile.id}>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className={`rounded-full p-2 ${
                              profile.platform === 'instagram' ? 'bg-pink-100' : 'bg-blue-100'
                            }`}>
                              {profile.platform === 'instagram' && <Instagram className="h-5 w-5 text-pink-500" />}
                            </div>
                            <div>
                              <CardTitle className="capitalize">{profile.platform}</CardTitle>
                              <CardDescription>@{profile.username}</CardDescription>
                            </div>
                            <div className="ml-auto">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                profile.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {profile.connected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        {profile.connected && profile.stats && (
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-4 bg-muted rounded-md">
                                <p className="text-2xl font-bold">{profile.stats.followers.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Followers</p>
                              </div>
                              <div className="p-4 bg-muted rounded-md">
                                <p className="text-2xl font-bold">{profile.stats.posts}</p>
                                <p className="text-xs text-muted-foreground">Posts</p>
                              </div>
                              <div className="p-4 bg-muted rounded-md">
                                <p className="text-2xl font-bold">{profile.stats.engagement}%</p>
                                <p className="text-xs text-muted-foreground">Engagement</p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button 
                            variant={profile.connected ? "destructive" : "default"} 
                            size="sm"
                          >
                            {profile.connected ? "Disconnect" : "Connect"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No social media accounts connected</p>
                      <Button>Connect an Account</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
