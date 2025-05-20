
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { storageService } from '@/services/storageService';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
      role?: 'creator' | 'brand';
      [key: string]: any;
    }
  }
}

export const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Unexpected error checking admin role:', error);
    return false;
  }
};

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    throw error;
  }
};

export const uploadUserAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    const url = await storageService.uploadAvatar(userId, file);
    
    if (url) {
      // Update the user's profile with the new avatar URL
      await updateUserProfile(userId, { avatar_url: url });
    }
    
    return url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
};
