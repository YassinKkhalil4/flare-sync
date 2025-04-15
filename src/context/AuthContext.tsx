
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';
import { supabase, isRealSupabaseClient, persistSession, getPersistedSession } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'brand';
  plan: 'free' | 'pro';
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'creator' | 'brand') => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Convert Supabase User to UserProfile
  const mapUserToProfile = async (supabaseUser: User): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          email: data.email || supabaseUser.email || '',
          name: data.name || 'User',
          role: (data.role === 'brand') ? 'brand' : 'creator',
          plan: data.plan || 'free',
          avatar: data.avatar_url
        };
      }
      return null;
    } catch (error) {
      console.error('Error mapping user to profile:', error);
      return null;
    }
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuthStatus();

    if (isRealSupabaseClient()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          persistSession(session);
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          persistSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          persistSession(session);
        }
      });

      return () => {
        data.subscription.unsubscribe();
      };
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email || '',
          name: data.name || 'User',
          role: (data.role === 'brand') ? 'brand' : 'creator',
          plan: data.plan || 'free',
          avatar: data.avatar_url
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      if (isRealSupabaseClient()) {
        // First try to get session from Supabase
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          // If we have a session, fetch the user profile
          await fetchUserProfile(data.session.user.id);
        } else {
          // Try to get persisted session from localStorage
          const persistedSession = getPersistedSession();
          if (persistedSession && persistedSession.user) {
            // Use persisted session
            const { error } = await supabase.auth.setSession({
              access_token: persistedSession.access_token,
              refresh_token: persistedSession.refresh_token,
            });
            
            if (!error) {
              await fetchUserProfile(persistedSession.user.id);
            } else {
              // Invalid persisted session
              persistSession(null);
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } else {
        // Mock authentication for development
        const token = localStorage.getItem('flaresync_token');
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const storedUser = localStorage.getItem('flaresync_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Invalid state: token exists but no user data
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isRealSupabaseClient()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data?.user) {
          persistSession(data.session);
          const userProfile = await mapUserToProfile(data.user);
          if (userProfile) {
            setUser(userProfile);
            toast({
              title: "Login successful",
              description: `Welcome back, ${userProfile.name}!`,
            });
          }
        }
      } else {
        // Mock login for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'demo@flaresync.com' && password === 'password') {
          const mockUser: UserProfile = {
            id: '1',
            email: 'demo@flaresync.com',
            name: 'Demo User',
            role: 'creator',
            plan: 'free',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=demo'
          };

          localStorage.setItem('flaresync_token', 'mock_token');
          localStorage.setItem('flaresync_user', JSON.stringify(mockUser));

          setUser(mockUser);
          toast({
            title: "Login successful",
            description: `Welcome back, ${mockUser.name}!`,
          });
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'creator' | 'brand') => {
    setIsLoading(true);
    try {
      if (isRealSupabaseClient()) {
        // Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.user) {
          // Create initial profile in the database
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              name: name,
              role: role,
              plan: 'free',
              created_at: new Date().toISOString()
            });
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
          
          toast({
            title: "Registration successful",
            description: `Welcome to FlareSync, ${name}!`,
          });
          
          // Check if email confirmation is required
          if (data.session) {
            persistSession(data.session);
            const userProfile = await mapUserToProfile(data.user);
            if (userProfile) {
              setUser(userProfile);
            }
          } else {
            toast({
              title: "Email verification required",
              description: "Please check your email to verify your account before logging in.",
            });
            setUser(null);
          }
        }
      } else {
        // Mock signup for development
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: UserProfile = {
          id: '2',
          email,
          name,
          role,
          plan: 'free',
          avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`
        };

        localStorage.setItem('flaresync_token', 'mock_token');
        localStorage.setItem('flaresync_user', JSON.stringify(mockUser));

        setUser(mockUser);
        toast({
          title: "Registration successful",
          description: `Welcome to FlareSync, ${name}!`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isRealSupabaseClient()) {
      supabase.auth.signOut();
      persistSession(null);
    } else {
      localStorage.removeItem('flaresync_token');
      localStorage.removeItem('flaresync_user');
    }
    
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name ?? user.name,
          role: data.role ?? user.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, ...data };
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Upload failed",
        description: "You must be logged in to upload an avatar.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, avatar: data.publicUrl };
      });

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });

      return data.publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      checkAuthStatus, 
      updateProfile, 
      uploadAvatar 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
