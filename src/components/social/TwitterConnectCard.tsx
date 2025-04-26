
import React from 'react';
import { SocialProfile } from '@/types/messaging';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwitterConnectCardProps {
  profile?: SocialProfile;
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const TwitterConnectCard: React.FC<TwitterConnectCardProps> = ({
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
        <div className="rounded-full bg-blue-100 p-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            className="h-6 w-6 text-blue-500"
            fill="currentColor"
          >
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        </div>
        <div>
          <CardTitle>Twitter/X</CardTitle>
          <CardDescription>
            Connect your Twitter account to share posts and analytics
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
            ? "Your Twitter account is connected. You can now schedule posts and view analytics."
            : "Connect your Twitter account to schedule posts and view analytics from within FlareSync."}
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
            ) : "Connect Twitter"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwitterConnectCard;
