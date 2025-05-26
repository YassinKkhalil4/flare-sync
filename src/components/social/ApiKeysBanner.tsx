
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApiKeysBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert className="mb-6">
      <Settings className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Configure your API keys to enable social platform connections.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/api-keys-setup')}
        >
          Setup API Keys
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeysBanner;
