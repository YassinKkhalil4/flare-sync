
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SocialService } from '@/services/api';
import { SocialProfile } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useEncryption } from './useEncryption';

// Create a base hook for social connection logic
export const useSocialConnect = (platform: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isReady: encryptionReady, storeEncrypted, retrieveDecrypted } = useEncryption();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Force loading to false after 5 seconds to prevent infinite loading state
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError(`Couldn't load ${platform} profile data. Timeout reached.`);
      }
    }, 5000);

    const fetchProfile = async () => {
      if (!user || !encryptionReady) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const profiles = await SocialService.getProfiles();
        const foundProfile = profiles.find(p => p.platform === platform);
        setProfile(foundProfile || null);
      } catch (error) {
        console.error(`Error fetching ${platform} profile:`, error);
        setError(`Couldn't load ${platform} profile`);
      } finally {
        setIsLoading(false);
      }
    };

    if (encryptionReady) {
      fetchProfile();
    }
    
    return () => clearTimeout(timeout);
  }, [user, platform, toast, encryptionReady]);

  const initiateConnect = async (clientId?: string, redirectUri?: string, scope?: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to connect your account.',
        variant: 'destructive',
      });
      return;
    }

    if (!encryptionReady) {
      toast({
        title: 'Encryption not ready',
        description: 'Please wait while encryption is being initialized.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // For OAuth platforms, this would normally redirect to the platform's auth page
      // In our mock implementation, we'll just update the local state
      const newProfile = await SocialService.connectPlatform(platform);
      
      // In a real implementation, we would encrypt sensitive tokens
      if (newProfile.token) {
        // Encrypt the token before storing it
        await storeEncrypted('social_profiles', {
          user_id: user.id,
          platform,
          username: newProfile.username,
          token: newProfile.token // This will be encrypted
        }, ['token']);
      }
      
      setProfile(newProfile);
      
      toast({
        title: 'Account connected',
        description: `Your ${platform} account has been successfully connected.`,
      });
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      toast({
        title: 'Connection error',
        description: `Failed to connect your ${platform} account. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!profile) return;

    setIsConnecting(true);
    try {
      await SocialService.disconnectPlatform(profile.id);
      setProfile(prev => prev ? {...prev, connected: false} : null);
      
      toast({
        title: 'Account disconnected',
        description: `Your ${platform} account has been disconnected.`,
      });
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast({
        title: 'Disconnection error',
        description: `Failed to disconnect your ${platform} account. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncData = async () => {
    if (!profile) return;

    setIsSyncing(true);
    try {
      // In a real app, this would call the appropriate sync API
      // For our mock implementation, we'll simulate a sync
      const updatedProfile = await SocialService.syncPlatform(profile.id);
      setProfile(updatedProfile);
      
      toast({
        title: 'Sync completed',
        description: `Your ${platform} data has been updated.`,
      });
    } catch (error) {
      console.error(`Error syncing ${platform} data:`, error);
      toast({
        title: 'Sync error',
        description: `Failed to sync your ${platform} data. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    error,
    isConnected: !!profile?.connected,
    initiateConnect,
    disconnect,
    syncData,
    encryptionReady,
  };
};
