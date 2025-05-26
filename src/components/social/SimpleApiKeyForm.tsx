
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SimpleApiKeyForm = () => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState({
    instagram: false,
    twitter: false,
    tiktok: false,
    youtube: false,
    twitch: false
  });
  
  const [apiKeys, setApiKeys] = useState({
    instagram_app_id: '',
    instagram_app_secret: '',
    twitter_client_id: '',
    twitter_client_secret: '',
    tiktok_client_id: '',
    tiktok_client_secret: '',
    youtube_client_id: '',
    youtube_client_secret: '',
    twitch_client_id: '',
    twitch_client_secret: ''
  });

  const handleInputChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Store in localStorage for now (in production, these would be stored securely)
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value.trim()) {
        localStorage.setItem(`api_key_${key}`, value.trim());
      }
    });
    
    toast({
      title: 'API Keys Saved',
      description: 'Your API keys have been saved locally.',
    });
  };

  const toggleShowKey = (platform: string) => {
    setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const platforms = [
    {
      name: 'Instagram',
      key: 'instagram',
      fields: ['instagram_app_id', 'instagram_app_secret'],
      description: 'Instagram Basic Display API credentials'
    },
    {
      name: 'Twitter',
      key: 'twitter', 
      fields: ['twitter_client_id', 'twitter_client_secret'],
      description: 'Twitter API v2 OAuth 2.0 credentials'
    },
    {
      name: 'TikTok',
      key: 'tiktok',
      fields: ['tiktok_client_id', 'tiktok_client_secret'], 
      description: 'TikTok for Developers API credentials'
    },
    {
      name: 'YouTube',
      key: 'youtube',
      fields: ['youtube_client_id', 'youtube_client_secret'],
      description: 'Google Cloud Console YouTube API credentials'
    },
    {
      name: 'Twitch',
      key: 'twitch',
      fields: ['twitch_client_id', 'twitch_client_secret'],
      description: 'Twitch Developer Console credentials'
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Keys Setup</CardTitle>
        <CardDescription>
          Add your social platform API credentials to enable connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {platforms.map((platform) => (
          <div key={platform.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{platform.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleShowKey(platform.key)}
              >
                {showKeys[platform.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{platform.description}</p>
            
            {platform.fields.map((field) => (
              <div key={field} className="space-y-1">
                <Label htmlFor={field} className="text-sm">
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <Input
                  id={field}
                  type={showKeys[platform.key] ? 'text' : 'password'}
                  value={apiKeys[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                />
              </div>
            ))}
          </div>
        ))}
        
        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save API Keys
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimpleApiKeyForm;
