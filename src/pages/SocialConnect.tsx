
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstagramConnectCard from '@/components/social/InstagramConnectCard';
import TiktokConnectCard from '@/components/social/TiktokConnectCard';
import TwitterConnectCard from '@/components/social/TwitterConnectCard';
import YoutubeConnectCard from '@/components/social/YoutubeConnectCard';
import TwitchConnectCard from '@/components/social/TwitchConnectCard';
import ComingSoonCard from '@/components/social/ComingSoonCard';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';
import { SocialAPI } from '@/services/socialService';
import { useToast } from '@/hooks/use-toast';

const SocialConnect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Instagram
  const {
    isLoading: isInstagramLoading,
    isConnecting: isInstagramConnecting,
    isSyncing: isInstagramSyncing,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
  } = useInstagramConnect();
  
  // TikTok
  const {
    isLoading: isTiktokLoading,
    isConnecting: isTiktokConnecting,
    isSyncing: isTiktokSyncing,
    tiktokProfile,
    isTiktokConnected,
    initiateTiktokConnect,
    disconnectTiktok,
    syncTiktokData,
  } = useTiktokConnect();
  
  // Twitter / X
  const {
    isLoading: isTwitterLoading,
    isConnecting: isTwitterConnecting,
    isSyncing: isTwitterSyncing,
    twitterProfile,
    isTwitterConnected,
    initiateTwitterConnect,
    disconnectTwitter,
    syncTwitterData,
  } = useTwitterConnect();
  
  // YouTube
  const {
    isLoading: isYoutubeLoading,
    isConnecting: isYoutubeConnecting,
    isSyncing: isYoutubeSyncing,
    youtubeProfile,
    isYoutubeConnected,
    initiateYoutubeConnect,
    disconnectYoutube,
    syncYoutubeData,
  } = useYoutubeConnect();
  
  // Twitch
  const {
    isLoading: isTwitchLoading,
    isConnecting: isTwitchConnecting,
    isSyncing: isTwitchSyncing,
    twitchProfile,
    isTwitchConnected,
    initiateTwitchConnect,
    disconnectTwitch,
    syncTwitchData,
  } = useTwitchConnect();

  const isLoading = 
    isInstagramLoading || 
    isTiktokLoading || 
    isTwitterLoading || 
    isYoutubeLoading || 
    isTwitchLoading;

  useEffect(() => {
    if (!user) return;

    // Timeout to ensure we don't get stuck in loading state
    const loadTimeout = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 5000); // 5 seconds timeout

    // Check if any social account is connected using the SocialAPI
    const checkConnections = async () => {
      try {
        // Use the SocialAPI instead of directly querying Supabase
        const profiles = await SocialAPI.getProfiles();
        
        // Process the fetched profiles if needed
        console.log("Connected social profiles:", profiles);
        setInitialLoadComplete(true);
        
      } catch (error) {
        console.error('Error checking social connections:', error);
        toast({
          title: "Couldn't load social profiles",
          description: "There was an error loading your social profiles. Please try again later.",
          variant: "destructive"
        });
        setInitialLoadComplete(true);
      }
    };

    checkConnections();
    
    return () => {
      clearTimeout(loadTimeout);
    };
  }, [user, toast]);

  // Force complete loading after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoading, initialLoadComplete]);

  if (isLoading && !initialLoadComplete) {
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
      
      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="twitch">Twitch</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instagram">
          <InstagramConnectCard
            profile={instagramProfile}
            isConnected={isInstagramConnected}
            isConnecting={isInstagramConnecting}
            isSyncing={isInstagramSyncing}
            onConnect={initiateInstagramConnect}
            onDisconnect={disconnectInstagram}
            onSync={syncInstagramData}
          />
        </TabsContent>
        
        <TabsContent value="tiktok">
          <TiktokConnectCard
            profile={tiktokProfile}
            isConnected={isTiktokConnected}
            isConnecting={isTiktokConnecting}
            isSyncing={isTiktokSyncing}
            onConnect={initiateTiktokConnect}
            onDisconnect={disconnectTiktok}
            onSync={syncTiktokData}
          />
        </TabsContent>
        
        <TabsContent value="twitter">
          <TwitterConnectCard
            profile={twitterProfile}
            isConnected={isTwitterConnected}
            isConnecting={isTwitterConnecting}
            isSyncing={isTwitterSyncing}
            onConnect={initiateTwitterConnect}
            onDisconnect={disconnectTwitter}
            onSync={syncTwitterData}
          />
        </TabsContent>
        
        <TabsContent value="youtube">
          <YoutubeConnectCard
            profile={youtubeProfile}
            isConnected={isYoutubeConnected}
            isConnecting={isYoutubeConnecting}
            isSyncing={isYoutubeSyncing}
            onConnect={initiateYoutubeConnect}
            onDisconnect={disconnectYoutube}
            onSync={syncYoutubeData}
          />
        </TabsContent>
        
        <TabsContent value="twitch">
          <TwitchConnectCard
            profile={twitchProfile}
            isConnected={isTwitchConnected}
            isConnecting={isTwitchConnecting}
            isSyncing={isTwitchSyncing}
            onConnect={initiateTwitchConnect}
            onDisconnect={disconnectTwitch}
            onSync={syncTwitchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialConnect;
