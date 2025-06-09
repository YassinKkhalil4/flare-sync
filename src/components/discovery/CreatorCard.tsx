
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, MessageCircle, Instagram, Twitter, Youtube, TrendingUp } from 'lucide-react';

interface Creator {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  role?: string;
  social_profiles?: Array<{
    platform: string;
    followers: number;
    engagement: number;
    username: string;
  }>;
}

interface CreatorCardProps {
  creator: Creator;
  onSendOffer?: (creatorId: string) => void;
  onViewProfile?: (creatorId: string) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onSendOffer,
  onViewProfile
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'youtube': return Youtube;
      default: return Users;
    }
  };

  const totalFollowers = creator.social_profiles?.reduce((sum, profile) => sum + (profile.followers || 0), 0) || 0;
  const averageEngagement = creator.social_profiles?.length 
    ? creator.social_profiles.reduce((sum, profile) => sum + (profile.engagement || 0), 0) / creator.social_profiles.length 
    : 0;

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 5) return 'text-green-600';
    if (engagement >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {creator.avatar_url ? (
            <img 
              src={creator.avatar_url} 
              alt={creator.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-semibold">
                {creator.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{creator.full_name}</h3>
            {creator.username && (
              <p className="text-muted-foreground text-sm">@{creator.username}</p>
            )}
          </div>
          {creator.role === 'creator' && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Creator
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Users className="h-4 w-4" />
              <span className="font-semibold">{totalFollowers.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Followers</p>
          </div>
          <div className="space-y-1">
            <div className={`flex items-center justify-center gap-1 ${getEngagementColor(averageEngagement)}`}>
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">{averageEngagement.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Avg Engagement</p>
          </div>
        </div>

        {creator.social_profiles && creator.social_profiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Connected Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {creator.social_profiles.map((profile, index) => {
                const Icon = getPlatformIcon(profile.platform);
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-xs"
                  >
                    <Icon className="h-3 w-3" />
                    <span className="font-medium">{profile.followers.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewProfile?.(creator.id)}
            className="flex-1"
          >
            View Profile
          </Button>
          <Button 
            size="sm" 
            onClick={() => onSendOffer?.(creator.id)}
            className="flex-1"
          >
            Send Offer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
