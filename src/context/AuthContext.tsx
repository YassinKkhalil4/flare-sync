
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';

// Extended interface to include user profile data
interface ExtendedUser extends User {
  name?: string;
  username?: string;
  avatar?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{success: boolean, error?: string}>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: { name?: string, username?: string, bio?: string }) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signUp: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => {},
  refreshSession: async () => {},
  updateProfile: async () => false,
  uploadAvatar: async () => null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user has admin role
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Load user profile data
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (profile) {
        setUser(prev => 
          prev ? { 
            ...prev, 
            name: profile.full_name, 
            username: profile.username,
            avatar: profile.avatar_url
          } : null
        );
      }
      
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Initialize session from Supabase auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session and set up listener
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user as ExtendedUser);
          await checkAdminStatus(currentSession.user.id);
          await loadUserProfile(currentSession.user.id);
        }
        
        // Set up listener for auth state changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user as ExtendedUser);
              if (newSession.user) {
                await checkAdminStatus(newSession.user.id);
                await loadUserProfile(newSession.user.id);
              }
            } else {
              setSession(null);
              setUser(null);
              setIsAdmin(false);
            }
          }
        );
        
        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to initialize authentication',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [toast]);

  // Update profile method
  const updateProfile = async (data: { name?: string; username?: string; bio?: string }) => {
    try {
      if (!user) return false;
      
      const { success, error } = await userService.updateProfile(user.id, {
        fullName: data.name,
        username: data.username,
      });
      
      if (!success) throw new Error(error);
      
      // Update local user state
      setUser(prev => 
        prev ? {
          ...prev,
          name: data.name || prev.name,
          username: data.username || prev.username,
        } : null
      );
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Upload avatar method
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user) return null;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError, data } = await supabase.storage
        .from('user-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local user state
      setUser(prev => 
        prev ? { ...prev, avatar: publicUrl } : null
      );
      
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        await checkAdminStatus(data.user.id);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign up' 
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        if (refreshedSession.user) {
          await checkAdminStatus(refreshedSession.user.id);
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    updateProfile,
    uploadAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
