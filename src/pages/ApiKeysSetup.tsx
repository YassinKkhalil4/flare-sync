
import React from 'react';
import SimpleApiKeyForm from '@/components/social/SimpleApiKeyForm';

const ApiKeysSetup = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Keys Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure your social platform API credentials to enable connections.
        </p>
      </div>
      
      <SimpleApiKeyForm />
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Quick Setup Guide:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Instagram: Get credentials from Facebook Developers</li>
          <li>• Twitter: Get credentials from Twitter Developer Portal</li>
          <li>• TikTok: Get credentials from TikTok for Developers</li>
          <li>• YouTube: Get credentials from Google Cloud Console</li>
          <li>• Twitch: Get credentials from Twitch Developer Console</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeysSetup;
