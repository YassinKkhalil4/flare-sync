
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Key, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ApiKey {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  helpUrl?: string;
}

const API_KEYS: ApiKey[] = [
  {
    name: 'OPENAI_API_KEY',
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    required: true,
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  {
    name: 'INSTAGRAM_CLIENT_ID',
    label: 'Instagram Client ID',
    placeholder: 'Your Instagram App Client ID',
    required: false,
    helpUrl: 'https://developers.facebook.com/apps/'
  },
  {
    name: 'INSTAGRAM_CLIENT_SECRET',
    label: 'Instagram Client Secret',
    placeholder: 'Your Instagram App Client Secret',
    required: false,
    helpUrl: 'https://developers.facebook.com/apps/'
  },
  {
    name: 'TWITTER_CLIENT_ID',
    label: 'Twitter/X Client ID',
    placeholder: 'Your Twitter App Client ID',
    required: false,
    helpUrl: 'https://developer.twitter.com/en/portal/dashboard'
  },
  {
    name: 'TWITTER_CLIENT_SECRET',
    label: 'Twitter/X Client Secret',
    placeholder: 'Your Twitter App Client Secret',
    required: false,
    helpUrl: 'https://developer.twitter.com/en/portal/dashboard'
  }
];

const ApiKeySetup = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleKeyChange = (keyName: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const saveApiKey = async (keyName: string) => {
    const keyValue = apiKeys[keyName];
    if (!keyValue?.trim()) {
      toast({
        title: 'Missing API key',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('store-api-keys', {
        body: {
          apiKeys: {
            [keyName]: keyValue.trim()
          }
        }
      });

      if (error) throw error;

      setSavedKeys(prev => new Set([...prev, keyName]));
      toast({
        title: 'API key saved',
        description: `${keyName} has been saved securely`,
      });
    } catch (error: any) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error saving API key',
        description: error.message || 'Failed to save API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllKeys = async () => {
    const keysToSave = Object.entries(apiKeys).filter(([_, value]) => value?.trim());
    
    if (keysToSave.length === 0) {
      toast({
        title: 'No API keys to save',
        description: 'Please enter at least one API key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const cleanedKeys = Object.fromEntries(
        keysToSave.map(([key, value]) => [key, value.trim()])
      );

      const { data, error } = await supabase.functions.invoke('store-api-keys', {
        body: { apiKeys: cleanedKeys }
      });

      if (error) throw error;

      setSavedKeys(new Set(Object.keys(cleanedKeys)));
      toast({
        title: 'API keys saved',
        description: `${keysToSave.length} API key(s) saved successfully`,
      });
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      toast({
        title: 'Error saving API keys',
        description: error.message || 'Failed to save API keys',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your API keys to enable AI features and social platform integrations.
            All keys are encrypted and stored securely.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>OpenAI API Key is required</strong> for AI features like caption generation 
              and engagement prediction. Social platform keys are optional but needed for posting.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {API_KEYS.map((keyConfig) => (
              <div key={keyConfig.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={keyConfig.name} className="flex items-center gap-2">
                    {keyConfig.label}
                    {keyConfig.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    {savedKeys.has(keyConfig.name) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </Label>
                  {keyConfig.helpUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto p-1"
                    >
                      <a 
                        href={keyConfig.helpUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Get API Key <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    id={keyConfig.name}
                    type="password"
                    placeholder={keyConfig.placeholder}
                    value={apiKeys[keyConfig.name] || ''}
                    onChange={(e) => handleKeyChange(keyConfig.name, e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => saveApiKey(keyConfig.name)}
                    disabled={isLoading || !apiKeys[keyConfig.name]?.trim()}
                    variant="outline"
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={saveAllKeys}
              disabled={isLoading || Object.keys(apiKeys).length === 0}
              className="w-full"
            >
              {isLoading ? 'Saving...' : 'Save All API Keys'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySetup;
