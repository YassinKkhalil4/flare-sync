
import React from 'react';
import { SocialProfile } from '@/types/messaging';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YoutubeConnectCardProps {
  profile?: SocialProfile;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const YoutubeConnectCard: React.FC<YoutubeConnectCardProps> = ({
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
        <div className="rounded-full bg-red-100 p-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-red-600"
          >
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
            <path d="m10 15 5-3-5-3z" />
          </svg>
        </div>
        <div>
          <CardTitle>YouTube</CardTitle>
          <CardDescription>
            Connect your YouTube channel to share videos and analytics
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
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xl font-bold">{profile.stats.posts}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
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
            ? "Your YouTube channel is connected. You can now schedule videos and view analytics."
            : "Connect your YouTube channel to schedule videos and view analytics from within FlareSync."}
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
            ) : "Connect YouTube"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default YoutubeConnectCard;
