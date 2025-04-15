import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { SocialService } from '../services/api';
import { SocialProfile } from '../types/messaging';
import { supabase } from '../lib/supabase';

const SocialConnect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const data = await SocialService.getProfiles();
        setProfiles(data);
      } catch (error) {
        console.error('Failed to fetch social profiles:', error);
        toast({
          title: "Error loading profiles",
          description: "Could not load your connected social accounts.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
    
    // Handle OAuth redirect callback
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
      toast({
        title: "Instagram connected successfully!",
        description: "Your Instagram account has been linked to FlareSync.",
      });
      fetchProfiles();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
      toast({
        title: "Connection failed",
        description: error,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);
  
  const initiateInstagramConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get auth token to use as state parameter
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error('User not authenticated');
      }
      
      // Instagram OAuth configuration
      const instagramClientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 
                         `${window.location.origin}/api/instagram-callback`;
      
      if (!instagramClientId) {
        throw new Error('Instagram client ID not configured');
      }
      
      // Build Instagram authorization URL
      const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
      instagramAuthUrl.searchParams.append('client_id', instagramClientId);
      instagramAuthUrl.searchParams.append('redirect_uri', redirectUri);
      instagramAuthUrl.searchParams.append('scope', 'user_profile');
      instagramAuthUrl.searchParams.append('response_type', 'code');
      instagramAuthUrl.searchParams.append('state', data.session.access_token);
      
      // Redirect to Instagram authorization page
      window.location.href = instagramAuthUrl.toString();
    } catch (error) {
      console.error('Failed to connect Instagram:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Instagram. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };
  
  const disconnectInstagram = async () => {
    setIsConnecting(true);
    try {
      const instagramProfile = profiles.find(p => p.platform === 'instagram');
      if (!instagramProfile) {
        throw new Error('Instagram profile not found');
      }
      
      // Disconnect account
      await SocialService.disconnectPlatform(instagramProfile.id);
      
      // Update profiles list
      setProfiles(prev => 
        prev.map(profile => 
          profile.platform === 'instagram' 
            ? {...profile, connected: false} 
            : profile
        )
      );
      
      toast({
        title: "Instagram disconnected",
        description: "Your Instagram account has been unlinked from FlareSync.",
      });
    } catch (error) {
      console.error('Failed to disconnect Instagram:', error);
      toast({
        title: "Error disconnecting",
        description: "Could not disconnect your Instagram account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Get Instagram profile from our profiles state
  const instagramProfile = profiles.find(p => p.platform === 'instagram');
  const isInstagramConnected = instagramProfile?.connected || false;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your connected accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Connect Social Accounts</h1>
      <Separator className="mb-8" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full bg-pink-100 p-3">
              <Instagram className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <CardTitle>Instagram</CardTitle>
              <CardDescription>
                Connect your Instagram account to share posts and analytics
              </CardDescription>
            </div>
            {isInstagramConnected && (
              <div className="ml-auto flex items-center text-sm font-medium text-green-500">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Connected
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isInstagramConnected && instagramProfile?.stats ? (
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold">{instagramProfile.stats.followers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold">{instagramProfile.stats.posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-xl font-bold">{instagramProfile.stats.engagement}%</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last synced: {new Date(instagramProfile.lastSynced || '').toLocaleString()}
                </p>
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {isInstagramConnected 
                ? "Your Instagram account is connected. You can now schedule posts and view analytics."
                : "Connect your Instagram account to schedule posts and view analytics from within FlareSync."}
            </p>
          </CardContent>
          <CardFooter>
            {isInstagramConnected ? (
              <Button 
                variant="outline" 
                onClick={disconnectInstagram}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Disconnecting...
                  </>
                ) : "Disconnect Account"}
              </Button>
            ) : (
              <Button 
                onClick={initiateInstagramConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Connecting...
                  </>
                ) : "Connect Instagram"}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Placeholder for future social integrations */}
        <Card className="opacity-50">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <AlertCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle>More Platforms Coming Soon</CardTitle>
              <CardDescription>
                We're working on adding more social media platforms
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stay tuned for more platform integrations including TikTok, YouTube, and Twitter.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>Connect (Coming Soon)</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SocialConnect;
