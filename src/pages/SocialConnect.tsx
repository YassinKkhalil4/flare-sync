
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SocialPlatformTabs } from '@/components/social/SocialPlatformTabs';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';

const SocialConnect: React.FC = () => {
  const { hasSocialAccounts, isLoading } = useSocialPlatforms();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Show loading for at least 1 second for UX
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Social Media Accounts</h1>

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
            <SocialPlatformTabs />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialConnect;
