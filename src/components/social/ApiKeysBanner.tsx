
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ApiKeysBanner: React.FC = () => {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>API Configuration Required:</strong> To connect social media accounts, API credentials must be configured in your Supabase project settings.
          </div>
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://supabase.com/dashboard/project/lkezjcqdvxfrrfwwyjcp/settings/functions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Configure APIs
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeysBanner;
