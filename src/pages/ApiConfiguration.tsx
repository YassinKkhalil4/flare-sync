
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface APIKey {
  name: string;
  label: string;
  description: string;
  docsUrl: string;
  required: boolean;
}

const apiKeys: APIKey[] = [
  {
    name: 'OPENAI_API_KEY',
    label: 'OpenAI API Key',
    description: 'Required for AI-powered caption generation, content planning, and engagement prediction',
    docsUrl: 'https://platform.openai.com/api-keys',
    required: true
  },
  {
    name: 'INSTAGRAM_CLIENT_ID',
    label: 'Instagram Client ID',
    description: 'Required for Instagram account connection and posting',
    docsUrl: 'https://developers.facebook.com/apps/',
    required: false
  },
  {
    name: 'INSTAGRAM_CLIENT_SECRET',
    label: 'Instagram Client Secret',
    description: 'Required for Instagram account connection and posting',
    docsUrl: 'https://developers.facebook.com/apps/',
    required: false
  },
  {
    name: 'TWITTER_CLIENT_ID',
    label: 'Twitter Client ID',
    description: 'Required for Twitter/X account connection and posting',
    docsUrl: 'https://developer.twitter.com/en/portal/dashboard',
    required: false
  },
  {
    name: 'TWITTER_CLIENT_SECRET',
    label: 'Twitter Client Secret',
    description: 'Required for Twitter/X account connection and posting',
    docsUrl: 'https://developer.twitter.com/en/portal/dashboard',
    required: false
  },
  {
    name: 'TIKTOK_CLIENT_KEY',
    label: 'TikTok Client Key',
    description: 'Required for TikTok account connection and posting',
    docsUrl: 'https://developers.tiktok.com/',
    required: false
  },
  {
    name: 'TIKTOK_CLIENT_SECRET',
    label: 'TikTok Client Secret',
    description: 'Required for TikTok account connection and posting',
    docsUrl: 'https://developers.tiktok.com/',
    required: false
  }
];

const ApiConfiguration: React.FC = () => {
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleKeyChange = (keyName: string, value: string) => {
    setKeyValues(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const saveKey = async (keyName: string) => {
    const value = keyValues[keyName]?.trim();
    if (!value) {
      toast({
        title: 'Error',
        description: 'Please enter a value for the API key',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('store-api-keys', {
        body: { apiKeys: { [keyName]: value } },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (error) throw error;

      setSavedKeys(prev => new Set(prev).add(keyName));
      toast({
        title: 'Success',
        description: `${apiKeys.find(k => k.name === keyName)?.label} saved securely`,
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API key. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllKeys = async () => {
    const nonEmptyKeys = Object.entries(keyValues).reduce((acc, [key, value]) => {
      if (value?.trim()) {
        acc[key] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    if (Object.keys(nonEmptyKeys).length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one API key',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('store-api-keys', {
        body: { apiKeys: nonEmptyKeys },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (error) throw error;

      Object.keys(nonEmptyKeys).forEach(key => {
        setSavedKeys(prev => new Set(prev).add(key));
      });

      toast({
        title: 'Success',
        description: `${Object.keys(nonEmptyKeys).length} API key(s) saved securely`,
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API keys. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          API Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your API keys to enable social platform connections and AI features.
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="social">Social Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI features require API keys to function. These keys are stored securely and encrypted.
            </AlertDescription>
          </Alert>

          {apiKeys.filter(key => key.name.includes('OPENAI')).map((apiKey) => (
            <Card key={apiKey.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {apiKey.label}
                      {apiKey.required && <Badge variant="destructive">Required</Badge>}
                      {savedKeys.has(apiKey.name) && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Configured
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{apiKey.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(apiKey.docsUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={apiKey.name}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={apiKey.name}
                        type={showKeys[apiKey.name] ? "text" : "password"}
                        value={keyValues[apiKey.name] || ''}
                        onChange={(e) => handleKeyChange(apiKey.name, e.target.value)}
                        placeholder={`Enter your ${apiKey.label.toLowerCase()}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleShowKey(apiKey.name)}
                      >
                        {showKeys[apiKey.name] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => saveKey(apiKey.name)}
                      disabled={!keyValues[apiKey.name]?.trim() || isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Social platform API keys are optional but required for automated posting and advanced analytics.
            </AlertDescription>
          </Alert>

          {apiKeys.filter(key => !key.name.includes('OPENAI')).map((apiKey) => (
            <Card key={apiKey.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {apiKey.label}
                      {savedKeys.has(apiKey.name) && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Configured
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{apiKey.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(apiKey.docsUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={apiKey.name}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={apiKey.name}
                        type={showKeys[apiKey.name] ? "text" : "password"}
                        value={keyValues[apiKey.name] || ''}
                        onChange={(e) => handleKeyChange(apiKey.name, e.target.value)}
                        placeholder={`Enter your ${apiKey.label.toLowerCase()}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleShowKey(apiKey.name)}
                      >
                        {showKeys[apiKey.name] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => saveKey(apiKey.name)}
                      disabled={!keyValues[apiKey.name]?.trim() || isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={saveAllKeys} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Save All API Keys'}
        </Button>
      </div>
    </div>
  );
};

export default ApiConfiguration;
