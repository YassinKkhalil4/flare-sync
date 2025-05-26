
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  connectHandler: () => void;
  description: string;
  isConnecting: boolean;
}

export const SocialPlatformTabs = () => {
  const [activeTab, setActiveTab] = useState('instagram');
  const { profiles } = useSocialPlatforms();
  
  // Platform-specific hooks
  const { initiateInstagramConnect, isConnecting: instagramConnecting } = useInstagramConnect();
  const { initiateTwitterConnect, isConnecting: twitterConnecting } = useTwitterConnect();
  const { initiateTiktokConnect, isConnecting: tiktokConnecting } = useTiktokConnect();
  const { initiateYoutubeConnect, isConnecting: youtubeConnecting } = useYoutubeConnect();
  const { initiateTwitchConnect, isConnecting: twitchConnecting } = useTwitchConnect();
  
  const getProfileByPlatform = (platform: string) => {
    return profiles.find(p => p.platform === platform);
  };
  
  const platforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      connected: getProfileByPlatform('instagram')?.connected || false,
      connectHandler: initiateInstagramConnect,
      description: 'Connect your Instagram Business or Creator account to schedule posts and view analytics.',
      isConnecting: instagramConnecting
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      connected: getProfileByPlatform('twitter')?.connected || false,
      connectHandler: initiateTwitterConnect,
      description: 'Schedule tweets and analyze your Twitter engagement metrics.',
      isConnecting: twitterConnecting
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <PlatformIcon platform="tiktok" className="h-5 w-5" />,
      connected: getProfileByPlatform('tiktok')?.connected || false,
      connectHandler: initiateTiktokConnect,
      description: 'Connect your TikTok account to schedule videos and track performance.',
      isConnecting: tiktokConnecting
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      connected: getProfileByPlatform('youtube')?.connected || false,
      connectHandler: initiateYoutubeConnect,
      description: 'Manage your YouTube channel, schedule videos, and track performance.',
      isConnecting: youtubeConnecting
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: <PlatformIcon platform="twitch" className="h-5 w-5" />,
      connected: getProfileByPlatform('twitch')?.connected || false,
      connectHandler: initiateTwitchConnect,
      description: 'Connect your Twitch channel to manage streams and track viewer engagement.',
      isConnecting: twitchConnecting
    }
  ];
  
  return (
    <Tabs defaultValue="instagram" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5 mb-8">
        {platforms.map((platform) => (
          <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
            {platform.icon}
            <span className="hidden sm:inline">{platform.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {platforms.map((platform) => {
        const profile = getProfileByPlatform(platform.id);
        
        return (
          <TabsContent key={platform.id} value={platform.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {platform.icon}
                    <CardTitle>{platform.name}</CardTitle>
                  </div>
                  {platform.connected && (
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Connected
                    </div>
                  )}
                </div>
                <CardDescription>
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {platform.connected && profile?.stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Followers</div>
                        <div className="text-2xl font-bold">{profile.stats.followers.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Posts</div>
                        <div className="text-2xl font-bold">{profile.stats.posts}</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Engagement</div>
                        <div className="text-2xl font-bold">{profile.stats.engagement}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last synced: {new Date(profile.lastSynced || '').toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="bg-primary/10 p-6 rounded-full mb-4">
                      {platform.icon}
                    </div>
                    <h3 className="text-lg font-medium mb-2">Not Connected</h3>
                    <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                      Connect your {platform.name} account to schedule posts and track performance metrics.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={platform.connectHandler} 
                  disabled={platform.isConnecting}
                  className="w-full flex items-center justify-center"
                >
                  {platform.isConnecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Connecting...
                    </>
                  ) : platform.connected ? (
                    "Manage Connection"
                  ) : (
                    <>
                      Connect {platform.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
