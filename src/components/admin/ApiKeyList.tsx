
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TestTube, Eye, EyeOff } from 'lucide-react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { ApiKeyData } from '@/services/apiKeyService';
import { useState } from 'react';

interface ApiKeyListProps {
  onTestKey?: (keyName: string, keyValue: string) => void;
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({ onTestKey }) => {
  const { apiKeys, deleteKey, testKey, isDeletingKey, isTestingKey } = useApiKeys();
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleTestKey = (key: ApiKeyData) => {
    if (onTestKey) {
      onTestKey(key.key_name, key.key_value);
    } else {
      testKey({ keyName: key.key_name, keyValue: key.key_value });
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
  };

  if (apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No API keys configured yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((key) => (
        <Card key={key.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {key.key_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <Badge variant="outline">
              {new Date(key.created_at).toLocaleDateString()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {visibleKeys[key.id] ? key.key_value : maskApiKey(key.key_value)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility(key.id)}
                >
                  {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestKey(key)}
                  disabled={isTestingKey}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteKey(key.id)}
                  disabled={isDeletingKey}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApiKeyList;
