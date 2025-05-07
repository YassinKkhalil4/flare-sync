
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { persistSession, getPersistedSession } from '@/lib/supabase';

type AuthContextType = {
  user: User & {
    name?: string;
    username?: string;
    avatar?: string;
  } | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  signUp: (data: { email: string, password: string, fullName?: string, username?: string, role?: string }) => Promise<{
    error: any;
    data: any;
  }>;
  signIn: (data: { email: string, password: string }) => Promise<{
    error: any;
    data: any;
  }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<{
    error: any;
    data: any;
  }>;
  uploadAvatar: (file: File) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  signUp: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  logout: async () => {},
  updateProfile: async () => ({ data: null, error: null }),
  uploadAvatar: async () => null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
  externalLandingPageUrl?: string;
}

export const AuthProvider = ({ children, externalLandingPageUrl = "https://flaresync.org" }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for session on component mount
  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      try {
        // First check for persisted session
        const persistedSession = getPersistedSession();
        
        if (persistedSession) {
          setSession(persistedSession);
          setUser({
            ...persistedSession.user,
            name: persistedSession.user?.user_metadata?.full_name,
            username: persistedSession.user?.user_metadata?.username,
            avatar: persistedSession.user?.user_metadata?.avatar_url,
          });
        }
        
        // Then check with Supabase
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (supabaseSession) {
          setSession(supabaseSession);
          setUser({
            ...supabaseSession.user,
            name: supabaseSession.user?.user_metadata?.full_name,
            username: supabaseSession.user?.user_metadata?.username,
            avatar: supabaseSession.user?.user_metadata?.avatar_url,
          });
          persistSession(supabaseSession);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast({
          title: 'Session Error',
          description: 'There was a problem loading your session. Please try logging in again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (newSession) {
        setSession(newSession);
        setUser({
          ...newSession.user,
          name: newSession.user?.user_metadata?.full_name,
          username: newSession.user?.user_metadata?.username,
          avatar: newSession.user?.user_metadata?.avatar_url,
        });
        persistSession(newSession);
      } else {
        setSession(null);
        setUser(null);
        persistSession(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: { email: string, password: string, fullName?: string, username?: string, role?: string }) => {
    try {
      const { email, password, fullName, username, role } = data;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            role
          },
        },
      });
      
      if (!error && authData?.user) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
        });
      }
      
      return { data: authData, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        data: null,
        error,
      };
    }
  };

  const signIn = async (data: { email: string, password: string }) => {
    try {
      const { email, password } = data;
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && authData?.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      }
      
      return { data: authData, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        data: null,
        error,
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'There was a problem signing out.',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id)
        .select()
        .single();
        
      if (!error && updatedData) {
        // Update local user state with new profile data
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: updatedData.full_name,
            username: updatedData.username,
            avatar: updatedData.avatar_url,
          };
        });
        
        // Update user metadata in auth
        await supabase.auth.updateUser({
          data: {
            full_name: updatedData.full_name,
            username: updatedData.username,
            avatar_url: updatedData.avatar_url
          }
        });
      }
      
      return { data: updatedData, error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        data: null,
        error,
      };
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: avatarUrl
        };
      });
      
      // Update user metadata in auth
      await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      });
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
      
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
      return null;
    }
  };

  const value = {
    user,
    session,
    loading,
    isLoading: loading,
    signUp,
    signIn,
    logout,
    updateProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
