
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const SocialConnect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Instagram is already connected
    const checkConnectionStatus = async () => {
      try {
        // In a real app, this would check with the backend API
        // For now, we'll simulate with localStorage
        const connected = localStorage.getItem('instagram_connected');
        if (connected === 'true') {
          setIsInstagramConnected(true);
        }
      } catch (error) {
        console.error('Failed to check Instagram connection status:', error);
      }
    };
    
    checkConnectionStatus();
    
    // Handle OAuth redirect callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      // Exchange the code for an access token
      handleOAuthCallback(code, state);
    }
  }, []);
  
  const handleOAuthCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      // In a real app, we would call the backend API to exchange the code for an access token
      // For demo purposes, we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save connection status
      localStorage.setItem('instagram_connected', 'true');
      setIsInstagramConnected(true);
      
      toast({
        title: "Instagram connected successfully!",
        description: "Your Instagram account has been linked to FlareSync.",
      });
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to connect Instagram:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Instagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const initiateInstagramConnect = () => {
    setIsLoading(true);
    
    // In a real app, we would redirect to Instagram OAuth flow
    // For demo purposes, we'll simulate the OAuth flow with a timeout
    setTimeout(() => {
      const redirectUrl = `${window.location.origin}/social-connect`;
      const instagramClientId = '12345678901234567'; // This would be your Instagram client ID
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state for verification when the user returns
      sessionStorage.setItem('instagram_oauth_state', state);
      
      // Build the Instagram OAuth URL
      const instagramOAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramClientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user_profile,user_media&response_type=code&state=${state}`;
      
      // In a real app, we would redirect to this URL:
      // window.location.href = instagramOAuthUrl;
      
      // For demo purposes, simulate a successful redirect and callback
      handleOAuthCallback('mock_code', state);
    }, 1000);
  };
  
  const disconnectInstagram = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem('instagram_connected');
      setIsInstagramConnected(false);
      setIsLoading(false);
      toast({
        title: "Instagram disconnected",
        description: "Your Instagram account has been unlinked from FlareSync.",
      });
    }, 1000);
  };

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
                disabled={isLoading}
              >
                {isLoading ? "Disconnecting..." : "Disconnect Account"}
              </Button>
            ) : (
              <Button 
                onClick={initiateInstagramConnect}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect Instagram"}
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
