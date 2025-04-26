
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import InstagramConnectCard from './InstagramConnectCard';
import TiktokConnectCard from './TiktokConnectCard';
import TwitterConnectCard from './TwitterConnectCard';
import YoutubeConnectCard from './YoutubeConnectCard';
import TwitchConnectCard from './TwitchConnectCard';
import { LoadingSpinner } from './LoadingSpinner';

export const SocialPlatformTabs = () => {
  const { isLoading, initialLoadComplete } = useSocialPlatforms();

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
        <InstagramConnectCard />
      </TabsContent>
      
      <TabsContent value="tiktok">
        <TiktokConnectCard />
      </TabsContent>
      
      <TabsContent value="twitter">
        <TwitterConnectCard />
      </TabsContent>
      
      <TabsContent value="youtube">
        <YoutubeConnectCard />
      </TabsContent>
      
      <TabsContent value="twitch">
        <TwitchConnectCard />
      </TabsContent>
    </Tabs>
  );
};
