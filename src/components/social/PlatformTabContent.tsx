
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw, Unlink } from 'lucide-react';
import { SocialProfile } from '@/types/messaging';

interface PlatformTabContentProps {
  platform: {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
  };
  profile?: SocialProfile;
  connected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

export const PlatformTabContent: React.FC<PlatformTabContentProps> = ({
  platform,
  profile,
  connected,
  isConnecting,
  isSyncing,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  return (
    <TabsContent value={platform.id}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {platform.icon}
              <CardTitle>{platform.name}</CardTitle>
            </div>
            {connected && (
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
          {connected && profile?.stats ? (
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
                Last synced: {profile.lastSynced ? new Date(profile.lastSynced).toLocaleString() : 'Never'}
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
        <CardFooter className="flex gap-2">
          {connected ? (
            <>
              <Button 
                onClick={onSync}
                disabled={isSyncing}
                variant="outline"
                className="flex items-center"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Data
                  </>
                )}
              </Button>
              <Button 
                onClick={onDisconnect}
                variant="destructive"
                className="flex items-center"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              onClick={onConnect} 
              disabled={isConnecting}
              className="w-full flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Connecting...
                </>
              ) : (
                <>
                  Connect {platform.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </TabsContent>
  );
};
