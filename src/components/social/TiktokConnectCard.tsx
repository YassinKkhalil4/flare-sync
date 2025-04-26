
import React from 'react';
import { SocialProfile } from '@/types/messaging';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TiktokConnectCardProps {
  profile?: SocialProfile;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const TiktokConnectCard: React.FC<TiktokConnectCardProps> = ({
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
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            className="h-6 w-6 text-red-500"
            fill="currentColor"
          >
            <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.537-2.477H10.5v10.77c0 1.314-1.113 2.376-2.496 2.376-1.385 0-2.497-1.062-2.497-2.376s1.112-2.376 2.497-2.376c.279 0 .54.043.784.13V6.5H5.062v.9c0 4.142 3.56 7.501 7.938 7.501V10.76a8.246 8.246 0 0 0 3.607.829V7.5c0-.707 0-.707 3.478-.707v-1.23h-.764Z" />
          </svg>
        </div>
        <div>
          <CardTitle>TikTok</CardTitle>
          <CardDescription>
            Connect your TikTok account to share posts and analytics
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
                <p className="text-xs text-muted-foreground">Posts</p>
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
            ? "Your TikTok account is connected. You can now schedule posts and view analytics."
            : "Connect your TikTok account to schedule posts and view analytics from within FlareSync."}
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
            ) : "Connect TikTok"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TiktokConnectCard;
