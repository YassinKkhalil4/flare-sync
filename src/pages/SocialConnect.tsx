
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { SocialPlatformTabs } from '@/components/social/SocialPlatformTabs';
import SocialConnectCallback from '@/components/social/SocialConnectCallback';

const SocialConnect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Handle OAuth callback if code is present in URL
  if (code || error) {
    const platform = localStorage.getItem('connecting_platform');
    return <SocialConnectCallback platform={platform || undefined} />;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Connect Your Social Accounts</h1>
        
        <Card className="p-6">
          <SocialPlatformTabs />
        </Card>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Connection Benefits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Post Scheduling</h3>
              <p className="text-muted-foreground">
                Schedule and automate your content across all your connected platforms.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">Unified Analytics</h3>
              <p className="text-muted-foreground">
                Track performance metrics across all your social accounts in one dashboard.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Get content recommendations and engagement predictions based on your audience data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SocialConnect;
