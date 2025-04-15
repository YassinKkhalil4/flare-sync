
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialProfile } from '@/types/messaging';
import { SocialService } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useSocialConnect = (platform: string) => {
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
      console.error(`Failed to fetch social profiles:`, error);
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
    const platformParam = urlParams.get('platform');
    
    // Only process if this platform is being handled or if platform param matches
    if ((platformParam && platformParam !== platform)) {
      return;
    }
    
    if (success === 'true') {
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`,
        description: `Your ${platform} account has been linked to FlareSync.`,
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
  }, [toast, user, platform]);

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsConnecting(true);
    try {
      await SocialService.connectPlatform(platform, code, state);
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`,
        description: `Your ${platform} account has been linked to FlareSync.`,
      });
      fetchProfiles();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error(`Failed to complete ${platform} connection:`, error);
      toast({
        title: "Connection failed",
        description: `Could not connect to ${platform}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const initiateSocialConnect = async (clientId: string, redirectUri: string, scope: string) => {
    setIsConnecting(true);
    
    try {
      // Get auth token to use as state parameter
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        throw new Error('User not authenticated');
      }
      
      // Build authorization URL based on platform
      let authUrl: URL;
      switch (platform) {
        case 'instagram':
          authUrl = new URL('https://api.instagram.com/oauth/authorize');
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('scope', scope);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('state', data.session.access_token);
          break;
        case 'tiktok':
          authUrl = new URL('https://open-api.tiktok.com/platform/oauth/connect');
          authUrl.searchParams.append('client_key', clientId);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('scope', scope);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('state', data.session.access_token);
          break;
        case 'twitter':
          authUrl = new URL('https://x.com/i/oauth2/authorize');
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('scope', scope);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('state', data.session.access_token);
          authUrl.searchParams.append('code_challenge_method', 'plain');
          authUrl.searchParams.append('code_challenge', 'challenge');
          break;
        case 'youtube':
          authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('scope', scope);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('state', data.session.access_token);
          authUrl.searchParams.append('access_type', 'offline');
          authUrl.searchParams.append('prompt', 'consent');
          break;
        case 'twitch':
          authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
          authUrl.searchParams.append('client_id', clientId);
          authUrl.searchParams.append('redirect_uri', redirectUri);
          authUrl.searchParams.append('scope', scope);
          authUrl.searchParams.append('response_type', 'code');
          authUrl.searchParams.append('state', data.session.access_token);
          authUrl.searchParams.append('force_verify', 'true');
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      // Add platform param to identify which platform is being connected on callback
      authUrl.searchParams.append('platform', platform);
      
      // Redirect to authorization page
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      toast({
        title: "Connection failed",
        description: `Could not connect to ${platform}. Please try again.`,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };
  
  const disconnectSocial = async () => {
    setIsConnecting(true);
    try {
      const socialProfile = profiles.find(p => p.platform === platform);
      if (!socialProfile) {
        throw new Error(`${platform} profile not found`);
      }
      
      // Disconnect account
      await SocialService.disconnectPlatform(socialProfile.id);
      
      // Update profiles list
      setProfiles(prev => 
        prev.map(profile => 
          profile.platform === platform 
            ? {...profile, connected: false} 
            : profile
        )
      );
      
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`,
        description: `Your ${platform} account has been unlinked from FlareSync.`,
      });
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      toast({
        title: "Error disconnecting",
        description: `Could not disconnect your ${platform} account. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const syncSocialData = async () => {
    setIsSyncing(true);
    try {
      const socialProfile = profiles.find(p => p.platform === platform);
      if (!socialProfile || !socialProfile.connected) {
        throw new Error(`No connected ${platform} profile found`);
      }
      
      // Sync data
      const updatedProfile = await SocialService.syncPlatform(socialProfile.id);
      
      // Update profiles list
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === updatedProfile.id 
            ? updatedProfile
            : profile
        )
      );
      
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} data synced`,
        description: `Your ${platform} stats have been updated.`,
      });
    } catch (error) {
      console.error(`Failed to sync ${platform} data:`, error);
      toast({
        title: "Error syncing data",
        description: `Could not sync your ${platform} data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Get profile for this platform from our profiles state
  const socialProfile = profiles.find(p => p.platform === platform);
  const isSocialConnected = socialProfile?.connected || false;

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  };
};
