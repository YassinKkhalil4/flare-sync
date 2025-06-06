
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialConnectButton } from './SocialConnectButton';
import { Instagram, Twitter, Youtube, Music, Twitch } from 'lucide-react';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';
import { useToast } from '@/hooks/use-toast';

export const SocialPlatformTabs: React.FC = () => {
  const { toast } = useToast();

  // Instagram
  const {
    isLoading: instagramLoading,
    isConnecting: instagramConnecting,
    isSyncing: instagramSyncing,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
    handleCallback: handleInstagramCallback,
  } = useInstagramConnect();

  // Twitter
  const {
    isLoading: twitterLoading,
    isConnecting: twitterConnecting,
    isSyncing: twitterSyncing,
    twitterProfile,
    isTwitterConnected,
    initiateTwitterConnect,
    disconnectTwitter,
    syncTwitterData,
    handleCallback: handleTwitterCallback,
  } = useTwitterConnect();

  // TikTok
  const {
    isLoading: tiktokLoading,
    isConnecting: tiktokConnecting,
    isSyncing: tiktokSyncing,
    tiktokProfile,
    isTiktokConnected,
    initiateTiktokConnect,
    disconnectTiktok,
    syncTiktokData,
    handleCallback: handleTiktokCallback,
  } = useTiktokConnect();

  // YouTube
  const {
    isLoading: youtubeLoading,
    isConnecting: youtubeConnecting,
    isSyncing: youtubeSyncing,
    youtubeProfile,
    isYoutubeConnected,
    initiateYoutubeConnect,
    disconnectYoutube,
    syncYoutubeData,
    handleCallback: handleYoutubeCallback,
  } = useYoutubeConnect();

  // Twitch
  const {
    isLoading: twitchLoading,
    isConnecting: twitchConnecting,
    isSyncing: twitchSyncing,
    twitchProfile,
    isTwitchConnected,
    initiateTwitchConnect,
    disconnectTwitch,
    syncTwitchData,
    handleCallback: handleTwitchCallback,
  } = useTwitchConnect();

  // Handle OAuth callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: 'OAuth Error',
        description: `Authentication failed: ${error}`,
        variant: 'destructive',
      });
      return;
    }

    if (code && state) {
      // Determine which platform based on the current URL or state
      const platform = urlParams.get('platform') || localStorage.getItem('connecting_platform');
      
      if (platform) {
        switch (platform) {
          case 'instagram':
            handleInstagramCallback(code);
            break;
          case 'twitter':
            handleTwitterCallback(code);
            break;
          case 'tiktok':
            handleTiktokCallback(code);
            break;
          case 'youtube':
            handleYoutubeCallback(code);
            break;
          case 'twitch':
            handleTwitchCallback(code);
            break;
        }
        
        // Clean up
        localStorage.removeItem('connecting_platform');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handlePlatformConnect = (platform: string, connectFunction: () => void) => {
    localStorage.setItem('connecting_platform', platform);
    connectFunction();
  };

  return (
    <Tabs defaultValue="instagram" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="instagram">Instagram</TabsTrigger>
        <TabsTrigger value="twitter">Twitter</TabsTrigger>
        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
        <TabsTrigger value="youtube">YouTube</TabsTrigger>
        <TabsTrigger value="twitch">Twitch</TabsTrigger>
      </TabsList>

      <TabsContent value="instagram" className="mt-6">
        <SocialConnectButton
          platform="instagram"
          icon={<Instagram className="h-6 w-6 text-pink-500" />}
          isConnected={isInstagramConnected}
          isLoading={instagramLoading}
          isConnecting={instagramConnecting}
          isSyncing={instagramSyncing}
          profile={instagramProfile}
          onConnect={() => handlePlatformConnect('instagram', initiateInstagramConnect)}
          onDisconnect={disconnectInstagram}
          onSync={syncInstagramData}
        />
      </TabsContent>

      <TabsContent value="twitter" className="mt-6">
        <SocialConnectButton
          platform="twitter"
          icon={<Twitter className="h-6 w-6 text-blue-500" />}
          isConnected={isTwitterConnected}
          isLoading={twitterLoading}
          isConnecting={twitterConnecting}
          isSyncing={twitterSyncing}
          profile={twitterProfile}
          onConnect={() => handlePlatformConnect('twitter', initiateTwitterConnect)}
          onDisconnect={disconnectTwitter}
          onSync={syncTwitterData}
        />
      </TabsContent>

      <TabsContent value="tiktok" className="mt-6">
        <SocialConnectButton
          platform="tiktok"
          icon={<Music className="h-6 w-6 text-black" />}
          isConnected={isTiktokConnected}
          isLoading={tiktokLoading}
          isConnecting={tiktokConnecting}
          isSyncing={tiktokSyncing}
          profile={tiktokProfile}
          onConnect={() => handlePlatformConnect('tiktok', initiateTiktokConnect)}
          onDisconnect={disconnectTiktok}
          onSync={syncTiktokData}
        />
      </TabsContent>

      <TabsContent value="youtube" className="mt-6">
        <SocialConnectButton
          platform="youtube"
          icon={<Youtube className="h-6 w-6 text-red-500" />}
          isConnected={isYoutubeConnected}
          isLoading={youtubeLoading}
          isConnecting={youtubeConnecting}
          isSyncing={youtubeSyncing}
          profile={youtubeProfile}
          onConnect={() => handlePlatformConnect('youtube', initiateYoutubeConnect)}
          onDisconnect={disconnectYoutube}
          onSync={syncYoutubeData}
        />
      </TabsContent>

      <TabsContent value="twitch" className="mt-6">
        <SocialConnectButton
          platform="twitch"
          icon={<Twitch className="h-6 w-6 text-purple-500" />}
          isConnected={isTwitchConnected}
          isLoading={twitchLoading}
          isConnecting={twitchConnecting}
          isSyncing={twitchSyncing}
          profile={twitchProfile}
          onConnect={() => handlePlatformConnect('twitch', initiateTwitchConnect)}
          onDisconnect={disconnectTwitch}
          onSync={syncTwitchData}
        />
      </TabsContent>
    </Tabs>
  );
};
