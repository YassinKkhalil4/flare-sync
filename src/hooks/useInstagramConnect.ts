
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SocialProfile } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';

export const useInstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Instagram OAuth configuration
  const CLIENT_ID = "instagram-client-id";  // Replace in production
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user_profile,user_media";

  useEffect(() => {
    if (user) {
      fetchInstagramConnection();
    }
  }, [user]);

  const fetchInstagramConnection = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'instagram')
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching Instagram connection:", error);
        return;
      }
      
      if (data) {
        setProfile(data as unknown as SocialProfile);
        setIsConnected(Boolean(data.connected));
      }
    } catch (error) {
      console.error("Error in fetchInstagramConnection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateInstagramConnect = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect your Instagram account",
        variant: "destructive"
      });
      return;
    }
    
    setIsConnecting(true);
    
    // In a real app, this would redirect to Instagram OAuth
    // For demo purposes, we'll simulate connecting after a delay
    setTimeout(() => {
      createOrUpdateProfile({
        user_id: user.id,
        platform: 'instagram',
        username: 'demo_instagram_user',
        connected: true,
        stats: {
          followers: 2500,
          posts: 87,
          engagement: 3.2
        },
        lastSynced: new Date().toISOString()
      });
      
      toast({
        title: "Instagram Connected",
        description: "Your Instagram account has been successfully connected."
      });
      
      setIsConnecting(false);
    }, 2000);
  };

  const disconnectInstagram = async () => {
    if (!user) return;
    
    try {
      setIsConnecting(true);
      
      const { error } = await supabase
        .from('social_profiles')
        .update({ connected: false })
        .eq('user_id', user.id)
        .eq('platform', 'instagram');
        
      if (error) {
        throw error;
      }
      
      setIsConnected(false);
      
      if (profile) {
        setProfile({
          ...profile,
          connected: false
        });
      }
      
      toast({
        title: "Instagram Disconnected",
        description: "Your Instagram account has been disconnected."
      });
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Instagram account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncInstagramData = async () => {
    if (!user || !isConnected) return;
    
    try {
      setIsSyncing(true);
      
      // In a real app, this would call the Instagram API to get fresh data
      // For demo purposes, we'll update with simulated data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedStats = {
        followers: Math.floor(2500 + Math.random() * 100),
        posts: 87 + Math.floor(Math.random() * 3),
        engagement: 3.2 + (Math.random() * 0.5)
      };
      
      await createOrUpdateProfile({
        user_id: user.id,
        platform: 'instagram',
        username: 'demo_instagram_user',
        connected: true,
        stats: updatedStats,
        lastSynced: new Date().toISOString()
      });
      
      if (profile) {
        setProfile({
          ...profile,
          stats: updatedStats,
          lastSynced: new Date().toISOString()
        });
      }
      
      toast({
        title: "Sync Completed",
        description: "Your Instagram data has been updated."
      });
    } catch (error) {
      console.error("Error syncing Instagram data:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Instagram data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const createOrUpdateProfile = async (profileData: any) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .upsert(profileData)
        .select()
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      setProfile(data as unknown as SocialProfile);
      setIsConnected(Boolean(data.connected));
      return data;
    } catch (error) {
      console.error("Error creating/updating social profile:", error);
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile: profile,
    isInstagramConnected: isConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
  };
};
