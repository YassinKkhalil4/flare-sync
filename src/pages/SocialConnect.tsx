
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InstagramConnectCard from '@/components/social/InstagramConnectCard';
import TwitterConnectCard from '@/components/social/TwitterConnectCard';
import TiktokConnectCard from '@/components/social/TiktokConnectCard';
import YoutubeConnectCard from '@/components/social/YoutubeConnectCard';
import TwitchConnectCard from '@/components/social/TwitchConnectCard';
import SocialConnectCallback from '@/components/social/SocialConnectCallback';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

const SocialConnect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Platform connection hooks
  const {
    isLoading: isLoadingInstagram,
    isConnecting: isConnectingInstagram,
    isSyncing: isSyncingInstagram,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
    handleCallback: handleInstagramCallback
  } = useInstagramConnect();
  
  const {
    isLoading: isLoadingTwitter,
    isConnecting: isConnectingTwitter,
    isSyncing: isSyncingTwitter,
    twitterProfile,
    isTwitterConnected,
    initiateTwitterConnect,
    disconnectTwitter,
    syncTwitterData,
    handleCallback: handleTwitterCallback
  } = useTwitterConnect();
  
  const {
    isLoading: isLoadingTiktok,
    isConnecting: isConnectingTiktok,
    isSyncing: isSyncingTiktok,
    tiktokProfile,
    isTiktokConnected,
    initiateTiktokConnect,
    disconnectTiktok,
    syncTiktokData,
    handleCallback: handleTiktokCallback
  } = useTiktokConnect();
  
  const {
    isLoading: isLoadingYoutube,
    isConnecting: isConnectingYoutube,
    isSyncing: isSyncingYoutube,
    youtubeProfile,
    isYoutubeConnected,
    initiateYoutubeConnect,
    disconnectYoutube,
    syncYoutubeData,
    handleCallback: handleYoutubeCallback
  } = useYoutubeConnect();
  
  const {
    isLoading: isLoadingTwitch,
    isConnecting: isConnectingTwitch,
    isSyncing: isSyncingTwitch,
    twitchProfile,
    isTwitchConnected,
    initiateTwitchConnect,
    disconnectTwitch,
    syncTwitchData,
    handleCallback: handleTwitchCallback
  } = useTwitchConnect();
  
  // Handle OAuth callback if code is present in URL
  if (code || error) {
    const platform = localStorage.getItem('connecting_platform');
    
    return <SocialConnectCallback platform={platform || undefined} />;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Connect Your Social Accounts</h1>
        
        <Card className="p-6">
          <Tabs defaultValue="instagram">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="twitch">Twitch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instagram">
              <InstagramConnectCard
                profile={instagramProfile}
                isConnected={isInstagramConnected}
                isConnecting={isConnectingInstagram}
                isSyncing={isSyncingInstagram}
                onConnect={() => {
                  localStorage.setItem('connecting_platform', 'instagram');
                  initiateInstagramConnect();
                }}
                onDisconnect={disconnectInstagram}
                onSync={syncInstagramData}
              />
            </TabsContent>
            
            <TabsContent value="twitter">
              <TwitterConnectCard
                profile={twitterProfile}
                isConnected={isTwitterConnected}
                isConnecting={isConnectingTwitter}
                isSyncing={isSyncingTwitter}
                onConnect={() => {
                  localStorage.setItem('connecting_platform', 'twitter');
                  initiateTwitterConnect();
                }}
                onDisconnect={disconnectTwitter}
                onSync={syncTwitterData}
              />
            </TabsContent>
            
            <TabsContent value="tiktok">
              <TiktokConnectCard
                profile={tiktokProfile}
                isConnected={isTiktokConnected}
                isConnecting={isConnectingTiktok}
                isSyncing={isSyncingTiktok}
                onConnect={() => {
                  localStorage.setItem('connecting_platform', 'tiktok');
                  initiateTiktokConnect();
                }}
                onDisconnect={disconnectTiktok}
                onSync={syncTiktokData}
              />
            </TabsContent>
            
            <TabsContent value="youtube">
              <YoutubeConnectCard
                profile={youtubeProfile}
                isConnected={isYoutubeConnected}
                isConnecting={isConnectingYoutube}
                isSyncing={isSyncingYoutube}
                onConnect={() => {
                  localStorage.setItem('connecting_platform', 'youtube');
                  initiateYoutubeConnect();
                }}
                onDisconnect={disconnectYoutube}
                onSync={syncYoutubeData}
              />
            </TabsContent>
            
            <TabsContent value="twitch">
              <TwitchConnectCard
                profile={twitchProfile}
                isConnected={isTwitchConnected}
                isConnecting={isConnectingTwitch}
                isSyncing={isSyncingTwitch}
                onConnect={() => {
                  localStorage.setItem('connecting_platform', 'twitch');
                  initiateTwitchConnect();
                }}
                onDisconnect={disconnectTwitch}
                onSync={syncTwitchData}
              />
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Connection Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Post Scheduling</h3>
              <p className="text-muted-foreground">
                Schedule and automate your content across all your connected platforms.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Unified Analytics</h3>
              <p className="text-muted-foreground">
                Track performance metrics across all your social accounts in one dashboard.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Get content recommendations and engagement predictions based on your audience data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SocialConnect;
