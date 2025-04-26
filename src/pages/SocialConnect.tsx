
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { SocialPlatformTabs } from '@/components/social/SocialPlatformTabs';

const SocialConnect = () => {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Connect Social Accounts</h1>
      <Separator className="mb-8" />
      <SocialPlatformTabs />
    </div>
  );
};

export default SocialConnect;
