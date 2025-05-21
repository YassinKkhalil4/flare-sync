
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, Youtube, Facebook, ArrowRight } from 'lucide-react';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { toast } from '@/hooks/use-toast';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  connectHandler: () => void;
  description: string;
}

export const SocialPlatformTabs = () => {
  const [activeTab, setActiveTab] = useState('instagram');
  const { connectPlatform, isConnecting } = useSocialPlatforms();
  
  const handleConnect = (platform: string) => {
    connectPlatform(platform);
  };
  
  const platforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      connected: false,
      connectHandler: () => handleConnect('instagram'),
      description: 'Connect your Instagram Business or Creator account to schedule posts and view analytics.'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      connected: false,
      connectHandler: () => {
        toast({
          title: "Coming Soon",
          description: "Twitter integration will be available soon.",
        });
      },
      description: 'Schedule tweets and analyze your Twitter engagement metrics.'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      connected: false,
      connectHandler: () => {
        toast({
          title: "Coming Soon",
          description: "YouTube integration will be available soon.",
        });
      },
      description: 'Manage your YouTube channel, schedule videos, and track performance.'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      connected: false,
      connectHandler: () => {
        toast({
          title: "Coming Soon",
          description: "Facebook integration will be available soon.",
        });
      },
      description: 'Manage Facebook pages, schedule posts, and analyze audience engagement.'
    }
  ];
  
  return (
    <Tabs defaultValue="instagram" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        {platforms.map((platform) => (
          <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
            {platform.icon}
            <span className="hidden sm:inline">{platform.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {platforms.map((platform) => (
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
              {platform.connected ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Followers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Engagement</div>
                      <div className="text-2xl font-bold">0%</div>
                    </div>
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
                disabled={isConnecting || (platform.id !== 'instagram')}
                className="w-full flex items-center justify-center"
              >
                {isConnecting && platform.id === 'instagram' ? (
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
      ))}
    </Tabs>
  );
};
