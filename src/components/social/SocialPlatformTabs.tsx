
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';
import InstagramConnectCard from './InstagramConnectCard';
import TiktokConnectCard from './TiktokConnectCard';
import TwitterConnectCard from './TwitterConnectCard';
import YoutubeConnectCard from './YoutubeConnectCard';
import TwitchConnectCard from './TwitchConnectCard';
import { LoadingSpinner } from './LoadingSpinner';

export const SocialPlatformTabs = () => {
  const { isLoading, initialLoadComplete } = useSocialPlatforms();
  const {
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
    instagramProfile,
    isLoading: isInstagramLoading,
    isConnecting: isInstagramConnecting,
    isSyncing: isInstagramSyncing,
  } = useInstagramConnect();

  const {
    isTiktokConnected,
    initiateTiktokConnect,
    disconnectTiktok,
    syncTiktokData,
    tiktokProfile,
    isLoading: isTiktokLoading,
    isConnecting: isTiktokConnecting,
    isSyncing: isTiktokSyncing,
  } = useTiktokConnect();

  const {
    isTwitterConnected,
    initiateTwitterConnect,
    disconnectTwitter,
    syncTwitterData,
    twitterProfile,
    isLoading: isTwitterLoading,
    isConnecting: isTwitterConnecting,
    isSyncing: isTwitterSyncing,
  } = useTwitterConnect();

  const {
    isYoutubeConnected,
    initiateYoutubeConnect,
    disconnectYoutube,
    syncYoutubeData,
    youtubeProfile,
    isLoading: isYoutubeLoading,
    isConnecting: isYoutubeConnecting,
    isSyncing: isYoutubeSyncing,
  } = useYoutubeConnect();

  const {
    isTwitchConnected,
    initiateTwitchConnect,
    disconnectTwitch,
    syncTwitchData,
    twitchProfile,
    isLoading: isTwitchLoading,
    isConnecting: isTwitchConnecting,
    isSyncing: isTwitchSyncing,
  } = useTwitchConnect();

  if (isLoading && !initialLoadComplete) {
    return <LoadingSpinner />;
  }

  return (
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
  );
};
