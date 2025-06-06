
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Trash2, RefreshCw, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheInfo {
  type: string;
  size: number;
  entries: number;
  lastCleared: string | null;
}

const CacheManager: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    setIsLoading(true);
    try {
      // Simulate cache analysis
      const mockCacheInfo: CacheInfo[] = [
        {
          type: 'Application Data',
          size: 2.5 * 1024 * 1024, // 2.5 MB
          entries: 150,
          lastCleared: localStorage.getItem('cache_cleared_app') || null
        },
        {
          type: 'Images & Media',
          size: 15.2 * 1024 * 1024, // 15.2 MB
          entries: 45,
          lastCleared: localStorage.getItem('cache_cleared_media') || null
        },
        {
          type: 'API Responses',
          size: 1.8 * 1024 * 1024, // 1.8 MB
          entries: 89,
          lastCleared: localStorage.getItem('cache_cleared_api') || null
        },
        {
          type: 'User Preferences',
          size: 0.5 * 1024 * 1024, // 0.5 MB
          entries: 25,
          lastCleared: localStorage.getItem('cache_cleared_prefs') || null
        }
      ];

      setCacheInfo(mockCacheInfo);
    } catch (error) {
      toast({
        title: 'Error Loading Cache Info',
        description: 'Failed to analyze cache data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (type?: string) => {
    setIsClearing(true);
    try {
      if (type) {
        // Clear specific cache type
        switch (type) {
          case 'Application Data':
            // Clear app-specific localStorage items
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('app_')) {
                localStorage.removeItem(key);
              }
            });
            localStorage.setItem('cache_cleared_app', new Date().toISOString());
            break;
          case 'Images & Media':
            // Clear media cache (would typically clear service worker cache)
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(name => name.includes('media') ? caches.delete(name) : null)
              );
            }
            localStorage.setItem('cache_cleared_media', new Date().toISOString());
            break;
          case 'API Responses':
            // Clear API cache
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(name => name.includes('api') ? caches.delete(name) : null)
              );
            }
            localStorage.setItem('cache_cleared_api', new Date().toISOString());
            break;
          case 'User Preferences':
            // Clear user preference cache
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('pref_')) {
                localStorage.removeItem(key);
              }
            });
            localStorage.setItem('cache_cleared_prefs', new Date().toISOString());
            break;
        }
        
        toast({
          title: 'Cache Cleared',
          description: `${type} cache has been cleared successfully`
        });
      } else {
        // Clear all caches
        localStorage.clear();
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        toast({
          title: 'All Caches Cleared',
          description: 'All cached data has been removed'
        });
      }

      await loadCacheInfo();
    } catch (error) {
      toast({
        title: 'Cache Clear Failed',
        description: 'Failed to clear cache data',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const totalSize = cacheInfo.reduce((sum, cache) => sum + cache.size, 0);
  const totalEntries = cacheInfo.reduce((sum, cache) => sum + cache.entries, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cache Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Analyzing cache...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Manager
        </CardTitle>
        <CardDescription>
          Manage application cache to improve performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <div className="text-sm text-muted-foreground">Total cache size</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <div className="text-sm text-muted-foreground">Total entries</div>
          </div>
        </div>

        {/* Cache Types */}
        <div className="space-y-3">
          {cacheInfo.map((cache, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{cache.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {cache.entries} entries • Last cleared: {formatDate(cache.lastCleared)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {formatFileSize(cache.size)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCache(cache.type)}
                  disabled={isClearing}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={loadCacheInfo}
            disabled={isClearing}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => clearCache()}
            disabled={isClearing}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Cache'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheManager;
