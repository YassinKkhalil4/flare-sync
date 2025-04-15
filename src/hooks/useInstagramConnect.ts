
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialProfile } from '@/types/messaging';
import { SocialService } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useInstagramConnect = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchProfiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await SocialService.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch social profiles:', error);
      toast({
        title: "Error loading profiles",
        description: "Could not load your connected social accounts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
    
    // Handle OAuth redirect callback
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (success === 'true') {
      toast({
        title: "Instagram connected successfully!",
        description: "Your Instagram account has been linked to FlareSync.",
      });
      fetchProfiles();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      toast({
        title: "Connection failed",
        description: error,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code && state) {
      // Handle OAuth callback with code
      handleOAuthCallback(code, state);
    }
  }, [toast, user]);

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsConnecting(true);
    try {
      await SocialService.connectPlatform('instagram', code, state);
      toast({
        title: "Instagram connected successfully!",
        description: "Your Instagram account has been linked to FlareSync.",
      });
      fetchProfiles();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to complete Instagram connection:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Instagram. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const initiateInstagramConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get auth token to use as state parameter
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error('User not authenticated');
      }
      
      // Instagram OAuth configuration
      const instagramClientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 
                         `${window.location.origin}/social-connect`;
      
      if (!instagramClientId) {
        throw new Error('Instagram client ID not configured');
      }
      
      // Build Instagram authorization URL
      const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
      instagramAuthUrl.searchParams.append('client_id', instagramClientId);
      instagramAuthUrl.searchParams.append('redirect_uri', redirectUri);
      instagramAuthUrl.searchParams.append('scope', 'user_profile,user_media');
      instagramAuthUrl.searchParams.append('response_type', 'code');
      instagramAuthUrl.searchParams.append('state', data.session.access_token);
      
      // Redirect to Instagram authorization page
      window.location.href = instagramAuthUrl.toString();
    } catch (error) {
      console.error('Failed to connect Instagram:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Instagram. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };
  
  const disconnectInstagram = async () => {
    setIsConnecting(true);
    try {
      const instagramProfile = profiles.find(p => p.platform === 'instagram');
      if (!instagramProfile) {
        throw new Error('Instagram profile not found');
      }
      
      // Disconnect account
      await SocialService.disconnectPlatform(instagramProfile.id);
      
      // Update profiles list
      setProfiles(prev => 
        prev.map(profile => 
          profile.platform === 'instagram' 
            ? {...profile, connected: false} 
            : profile
        )
      );
      
      toast({
        title: "Instagram disconnected",
        description: "Your Instagram account has been unlinked from FlareSync.",
      });
    } catch (error) {
      console.error('Failed to disconnect Instagram:', error);
      toast({
        title: "Error disconnecting",
        description: "Could not disconnect your Instagram account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const syncInstagramData = async () => {
    setIsSyncing(true);
    try {
      const instagramProfile = profiles.find(p => p.platform === 'instagram');
      if (!instagramProfile || !instagramProfile.connected) {
        throw new Error('No connected Instagram profile found');
      }
      
      // Sync data
      const updatedProfile = await SocialService.syncPlatform(instagramProfile.id);
      
      // Update profiles list
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === updatedProfile.id 
            ? updatedProfile
            : profile
        )
      );
      
      toast({
        title: "Instagram data synced",
        description: "Your Instagram stats have been updated.",
      });
    } catch (error) {
      console.error('Failed to sync Instagram data:', error);
      toast({
        title: "Error syncing data",
        description: "Could not sync your Instagram data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Get Instagram profile from our profiles state
  const instagramProfile = profiles.find(p => p.platform === 'instagram');
  const isInstagramConnected = instagramProfile?.connected || false;

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
  };
};
