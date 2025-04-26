
import React from 'react';
import { SocialProfile } from '@/types/messaging';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwitchConnectCardProps {
  profile?: SocialProfile;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const TwitchConnectCard: React.FC<TwitchConnectCardProps> = ({
  profile,
  isConnected,
  isConnecting,
  isSyncing,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-full bg-purple-100 p-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="h-6 w-6 text-purple-600"
          >
            <path d="M2.149 0L0.349 4.8V20.8H6.149V24H9.749L12.949 20.8H17.749L23.549 15V0H2.149ZM21.349 13.9L17.749 17.5H12.149L8.949 20.7V17.5H4.349V2.2H21.349V13.9Z" />
            <path d="M18.949 5.5H16.749V11.3H18.949V5.5Z" />
            <path d="M13.549 5.5H11.349V11.3H13.549V5.5Z" />
          </svg>
        </div>
        <div>
          <CardTitle>Twitch</CardTitle>
          <CardDescription>
            Connect your Twitch channel to share streams and analytics
          </CardDescription>
        </div>
        {isConnected && (
          <div className="ml-auto flex items-center text-sm font-medium text-green-500">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Connected
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isConnected && profile?.stats ? (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xl font-bold">{profile.stats.followers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xl font-bold">{profile.stats.posts}</p>
                <p className="text-xs text-muted-foreground">Streams</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xl font-bold">{profile.stats.engagement}%</p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(profile.lastSynced || '').toLocaleString()}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 p-2"
                onClick={onSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
              </Button>
            </div>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {isConnected 
            ? "Your Twitch channel is connected. You can now schedule streams and view analytics."
            : "Connect your Twitch channel to schedule streams and view analytics from within FlareSync."}
        </p>
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button 
            variant="outline" 
            onClick={onDisconnect}
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
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Connecting...
              </>
            ) : "Connect Twitch"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwitchConnectCard;
