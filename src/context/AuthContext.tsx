import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getPersistedSession, persistSession, ExtendedProfile, mapDatabaseProfileToExtended } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Extended User type with additional properties needed by components
export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  role?: 'creator' | 'brand' | 'admin';
  plan?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  isLoading: boolean; // Added for consistency
  isAdmin: boolean; // Added property
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true, // Added for consistency
  isAdmin: false, // Added default value
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  uploadAvatar: async () => undefined,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if the user has admin role
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if we have a session in localStorage
    const localSession = getPersistedSession();
    if (localSession) {
      setSession(localSession);
      fetchUserProfile(localSession.user.id);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        setSession(newSession);
        
        if (newSession?.user) {
          persistSession(newSession);
          fetchUserProfile(newSession.user.id);
        } else {
          setUser(null);
          persistSession(null);
        }
      }
    );

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user && !user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        // No session, finish loading
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" which just means no role assigned yet
        console.error('Error fetching user role:', roleError);
      }

      // Construct extended user profile
      const extendedUser: User = {
        id: userId,
        email: session?.user?.email || '',
        name: data?.full_name || '',
        username: data?.username || '',
        avatar: data?.avatar_url || '',
        role: roleData?.role || 'creator', // Default to creator if no role found
        // Add other properties as needed
      };

      setUser(extendedUser);
    } catch (error) {
      console.error('Error setting up user profile:', error);
      // If we can't get the profile, at least set basic user info
      setUser({
        id: userId,
        email: session?.user?.email || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { ...metadata },
        },
      });

      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    persistSession(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          username: data.username,
          // Add other fields as needed
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const uploadAvatar = async (file: File): Promise<string | undefined> => {
    if (!user) {
      toast({
        title: 'Upload failed',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return undefined;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);

      toast({
        title: 'Avatar uploaded',
        description: 'Your profile picture has been updated.',
      });

      return avatarUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      return undefined;
    }
  };

  const value = {
    user,
    session,
    loading,
    isLoading: loading, // Added for consistency
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
