
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialConnectButtonProps {
  platform: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isLoading?: boolean;
  isConnecting?: boolean;
  isSyncing?: boolean;
  profile?: {
    username?: string;
    followers?: number;
    posts?: number;
    engagement?: number;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

export const SocialConnectButton: React.FC<SocialConnectButtonProps> = ({
  platform,
  icon,
  isConnected,
  isLoading,
  isConnecting,
  isSyncing,
  profile,
  onConnect,
  onDisconnect,
  onSync,
}) => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const handleConnect = () => {
    try {
      onConnect();
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: `Failed to connect to ${platform}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = () => {
    try {
      onDisconnect();
    } catch (error) {
      toast({
        title: 'Disconnection Error',
        description: `Failed to disconnect from ${platform}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleSync = () => {
    try {
      onSync();
    } catch (error) {
      toast({
        title: 'Sync Error',
        description: `Failed to sync ${platform} data. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading {platform}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <CardTitle className="text-lg capitalize">{platform}</CardTitle>
              <CardDescription>
                {isConnected ? 'Connected' : 'Not connected'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isConnected && profile && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">@{profile.username}</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">{profile.followers?.toLocaleString() || 0}</div>
                <div className="text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="font-medium">{profile.posts?.toLocaleString() || 0}</div>
                <div className="text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="font-medium">{profile.engagement?.toFixed(1) || '0.0'}%</div>
                <div className="text-muted-foreground">Engagement</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Connect {platform}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                disabled={isConnecting}
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
