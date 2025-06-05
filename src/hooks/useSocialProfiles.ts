
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SocialProfile {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  followers?: number;
  posts?: number;
  engagement?: number;
  connected: boolean;
  access_token?: string;
  profile_url?: string;
  stats?: any;
  last_synced?: string;
  created_at: string;
  updated_at: string;
}

export const useSocialProfiles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['social-profiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SocialProfile[];
    },
    enabled: !!user?.id,
  });

  const connectPlatformMutation = useMutation({
    mutationFn: async ({ platform, username }: { platform: string; username: string }) => {
      // In a real implementation, this would initiate OAuth flow
      const { data, error } = await supabase
        .from('social_profiles')
        .insert({
          user_id: user?.id,
          platform,
          username,
          connected: true,
          followers: 0,
          posts: 0,
          engagement: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SocialProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
      toast({
        title: 'Platform connected',
        description: `${data.platform} account has been connected successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect platform',
        variant: 'destructive',
      });
    },
  });

  const disconnectPlatformMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('social_profiles')
        .update({ connected: false, access_token: null })
        .eq('id', profileId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
      toast({
        title: 'Platform disconnected',
        description: 'Account has been disconnected successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Disconnect failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect platform',
        variant: 'destructive',
      });
    },
  });

  const syncProfileMutation = useMutation({
    mutationFn: async (platform: string) => {
      const { data, error } = await supabase.functions.invoke(`sync-${platform}`, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-profiles'] });
      toast({
        title: 'Profile synced',
        description: 'Your profile data has been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync profile',
        variant: 'destructive',
      });
    },
  });

  return {
    profiles,
    isLoading,
    connectPlatform: connectPlatformMutation.mutate,
    disconnectPlatform: disconnectPlatformMutation.mutate,
    syncProfile: syncProfileMutation.mutate,
    isConnecting: connectPlatformMutation.isPending,
    isDisconnecting: disconnectPlatformMutation.isPending,
    isSyncing: syncProfileMutation.isPending,
  };
};
