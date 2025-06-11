
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SocialPlatformCard } from '@/components/social/SocialPlatformCard';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';
import ApiKeysBanner from '@/components/social/ApiKeysBanner';
import { SocialPlatformService, SocialProfile } from '@/services/socialPlatformService';
import { useAuth } from '@/context/AuthContext';

const SocialConnect: React.FC = () => {
  const { user } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  const { data: socialProfiles = [], isLoading, refetch } = useQuery({
    queryKey: ['social-profiles', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return SocialPlatformService.getUserProfiles(user.id);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const supportedPlatforms = SocialPlatformService.getSupportedPlatforms();

  const getProfileForPlatform = (platform: string): SocialProfile | undefined => {
    return socialProfiles.find(profile => profile.platform === platform);
  };

  const handleConnect = () => {
    refetch();
  };

  const handleDisconnect = () => {
    refetch();
  };

  const handleSync = () => {
    refetch();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Social Media Accounts</h1>

      <ApiKeysBanner />

      <Card>
        <CardHeader>
          <CardTitle>Connect Your Social Media Accounts</CardTitle>
          <CardDescription>
            Link your social media profiles to enable scheduling, analytics, and more.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(isLoading || showLoading) ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportedPlatforms.map((platform) => (
                <SocialPlatformCard
                  key={platform}
                  platform={platform}
                  profile={getProfileForPlatform(platform)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialConnect;
