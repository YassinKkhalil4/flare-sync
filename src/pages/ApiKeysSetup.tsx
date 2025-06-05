
import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import ApiKeySetup from '@/components/setup/ApiKeySetup';
import ApiKeyList from '@/components/admin/ApiKeyList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const ApiKeysSetup = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys Management</h1>
          <p className="text-muted-foreground">
            Configure and manage your API keys to unlock FlareSync's full potential
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            API keys are encrypted and stored securely. You can test each key after adding it to ensure it's working correctly.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New API Keys</CardTitle>
              <CardDescription>
                Enter your API keys to enable platform integrations and AI features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeySetup />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configured API Keys</CardTitle>
              <CardDescription>
                Manage your existing API keys and test their validity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyList />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApiKeysSetup;
