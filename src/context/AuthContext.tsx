
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
    role?: string;
    isAdmin?: boolean;
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
  adminSignIn: (data: { email: string, password: string }) => Promise<{
    error: any;
    data: any;
    isAdmin: boolean;
  }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<{
    error: any;
    data: any;
  }>;
  uploadAvatar: (file: File) => Promise<string | null>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  signUp: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  adminSignIn: async () => ({ data: null, error: null, isAdmin: false }),
  logout: async () => {},
  updateProfile: async () => ({ data: null, error: null }),
  uploadAvatar: async () => null,
  checkAdminStatus: async () => false,
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

  // Check if user has admin role
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Update user with admin status
  const updateUserWithRole = async (currentUser: User) => {
    if (!currentUser) return null;
    
    const isAdmin = await checkAdminStatus(currentUser.id);
    
    return {
      ...currentUser,
      name: currentUser?.user_metadata?.full_name,
      username: currentUser?.user_metadata?.username,
      avatar: currentUser?.user_metadata?.avatar_url,
      isAdmin,
      role: isAdmin ? 'admin' : currentUser?.user_metadata?.role || 'creator',
    };
  };

  // Check for session on component mount
  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      try {
        // First check for persisted session
        const persistedSession = getPersistedSession();
        
        if (persistedSession) {
          setSession(persistedSession);
          const userWithAdminRole = await updateUserWithRole(persistedSession.user);
          setUser(userWithAdminRole);
        }
        
        // Then check with Supabase
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (supabaseSession) {
          setSession(supabaseSession);
          const userWithAdminRole = await updateUserWithRole(supabaseSession.user);
          setUser(userWithAdminRole);
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
        const userWithAdminRole = await updateUserWithRole(newSession.user);
        setUser(userWithAdminRole);
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
        const userWithAdminRole = await updateUserWithRole(authData.user);
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        
        // Redirect admin users to the admin dashboard
        if (userWithAdminRole?.isAdmin) {
          navigate('/admin');
        }
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

  const adminSignIn = async (data: { email: string, password: string }) => {
    try {
      const { email, password } = data;
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (!authData?.user) {
        throw new Error('Authentication failed. Please check your credentials.');
      }
      
      // Check if user has admin role
      const isAdmin = await checkAdminStatus(authData.user.id);
      
      if (!isAdmin) {
        // Sign out the user if they're not an admin
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Update user object with admin status
      const userWithAdminRole = await updateUserWithRole(authData.user);
      
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin dashboard.',
      });
      
      // Redirect to admin dashboard
      navigate('/admin');
      
      return { data: authData, error: null, isAdmin: true };
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: 'Admin Login Failed',
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: 'destructive',
      });
      
      return {
        data: null,
        error,
        isAdmin: false,
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
    adminSignIn,
    logout,
    updateProfile,
    uploadAvatar,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
