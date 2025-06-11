
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Users,
  MessageCircle,
  Share2,
  TrendingUp,
  Unlink,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SocialProfile, SocialPlatformService } from '@/services/socialPlatformService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SocialPlatformCardProps {
  platform: string;
  profile?: SocialProfile;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: () => <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>
};

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  twitter: 'from-blue-400 to-blue-600',
  facebook: 'from-blue-600 to-blue-800',
  youtube: 'from-red-500 to-red-700',
  tiktok: 'from-black to-gray-800'
};

export const SocialPlatformCard: React.FC<SocialPlatformCardProps> = ({
  platform,
  profile,
  onConnect,
  onDisconnect,
  onSync
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const Icon = platformIcons[platform] || Users;
  const isConnected = profile?.connected || false;
  const gradientClass = platformColors[platform] || 'from-gray-500 to-gray-700';

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await SocialPlatformService.connectPlatform(platform);
      if (!result.success) {
        toast({
          title: 'Connection failed',
          description: result.error,
          variant: 'destructive',
        });
      }
      onConnect();
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const result = await SocialPlatformService.disconnectPlatform(platform);
      if (result.success) {
        toast({
          title: 'Disconnected',
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected`,
        });
        onDisconnect();
      } else {
        toast({
          title: 'Disconnection failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Disconnection failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await SocialPlatformService.syncPlatformData(platform);
      if (result.success) {
        toast({
          title: 'Sync completed',
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} data updated`,
        });
        onSync();
      } else {
        toast({
          title: 'Sync failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className={`relative overflow-hidden ${isConnected ? 'ring-2 ring-green-500' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5`} />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="capitalize text-lg">{platform}</CardTitle>
              {profile?.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {isConnected && profile ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(profile.followers)}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  Followers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(profile.posts)}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Share2 className="h-3 w-3" />
                  Posts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.engagement?.toFixed(1) || '0'}%</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Engagement
                </div>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engagement Rate</span>
                <span>{profile.engagement?.toFixed(1) || '0'}%</span>
              </div>
              <Progress value={profile.engagement || 0} className="h-2" />
            </div>

            {/* Last Sync */}
            {profile.last_synced && (
              <div className="text-xs text-muted-foreground">
                Last synced: {format(new Date(profile.last_synced), 'MMM d, yyyy HH:mm')}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Data
              </Button>
              
              {profile.profile_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(profile.profile_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
              >
                <Unlink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your {platform} account to enable scheduling, analytics, and more.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r ${gradientClass} hover:opacity-90`}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
