import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getPersistedSession, persistSession, ExtendedProfile, mapDatabaseProfileToExtended } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: ExtendedProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string, role: 'creator' | 'brand') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; username?: string; avatar_url?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // Check persisted session
        const persistedSession = getPersistedSession();
        if (persistedSession) {
          await supabase.auth.setSession(persistedSession);
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          const extendedProfile = mapDatabaseProfileToExtended(profile, session.user.email);
          setUser(extendedProfile);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      persistSession(session);

      if (event === 'INITIAL_SESSION') {
        // Skip initial session event, already handled
        return;
      }

      if (session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          const extendedProfile = mapDatabaseProfileToExtended(profile, session.user.email);
          setUser(extendedProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        const extendedProfile = mapDatabaseProfileToExtended(profile, data.session.user.email);
        setUser(extendedProfile);
      }

      toast({
        title: "Login successful",
        description: "You have successfully logged in."
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, username: string, role: 'creator' | 'brand') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            username: username,
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              username: username,
              role: role,
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          throw profileError;
        }

        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (selectError) {
          throw selectError;
        }

        const extendedProfile = mapDatabaseProfileToExtended(profile, data.user.email);
        setUser(extendedProfile);
      }

      toast({
        title: "Signup successful",
        description: "Account created successfully. Please check your email to verify your account."
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { 
    name?: string;
    username?: string;
    avatar_url?: string;
  }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase.from('profiles')
        .update({
          full_name: updates.name,
          username: updates.username,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        name: updates.name || prev.name,
        username: updates.username || prev.username,
        avatar: updates.avatar_url || prev.avatar
      } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) throw new Error('No user logged in');

    try {
      const filePath = `avatars/${user.id}/${file.name}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.path}`;

      // Update profile with avatar URL
      await updateProfile({ avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload your avatar. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    uploadAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
