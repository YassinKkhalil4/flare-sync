
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import ApiKeySetup from '@/components/setup/ApiKeySetup';

const ApiKeysSetup = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys Setup</h1>
          <p className="text-muted-foreground">
            Configure your API keys to unlock FlareSync's full potential
          </p>
        </div>
        
        <ApiKeySetup />
      </div>
    </MainLayout>
  );
};

export default ApiKeysSetup;
