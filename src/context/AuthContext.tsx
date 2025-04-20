
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  persistSession, 
  getPersistedSession, 
  isRealSupabaseClient, 
  ExtendedProfile,
  mapDatabaseProfileToExtended
} from '../lib/supabase';

interface UserProfile extends ExtendedProfile {
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string, role: 'creator' | 'brand') => Promise<void>;
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
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Check if user has admin role
      const { data: isAdminData, error: roleError } = await supabase
        .rpc('has_role', {
          user_id: supabaseUser.id,
          role: 'admin'
        });
      
      if (roleError) throw roleError;

      if (profileData) {
        // Create an extended profile with required fields
        const extendedProfile = mapDatabaseProfileToExtended(profileData, supabaseUser.email || '');
        
        return {
          ...extendedProfile,
          isAdmin: isAdminData || false
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

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Check if user has admin role
      const { data: isAdminData, error: roleError } = await supabase
        .rpc('has_role', {
          user_id: userId,
          role: 'admin'
        });
      
      if (roleError) throw roleError;

      if (profileData) {
        const extendedProfile = mapDatabaseProfileToExtended(profileData);
        
        const userProfile: UserProfile = {
          ...extendedProfile,
          isAdmin: isAdminData || false
        };
        
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
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
            username: 'demo',
            role: 'creator',
            plan: 'free',
            avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=demo',
            isAdmin: false,
            user_metadata: {}
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

  const signup = async (email: string, password: string, name: string, username: string, role: 'creator' | 'brand') => {
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
              username: username,
              role: role
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.user) {
          // The profile table will be created by the database trigger
          // Update additional user info
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: role,
              plan: 'free',
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error('Error updating profile:', updateError);
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
          username,
          role,
          plan: 'free',
          avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
          isAdmin: false,
          user_metadata: {}
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
      // Convert our extended profile data to what Supabase expects
      const supabaseProfileData: any = {};
      
      if (data.name !== undefined) {
        supabaseProfileData.full_name = data.name;
      }
      
      if (data.username !== undefined) {
        supabaseProfileData.username = data.username;
      }
      
      if (data.avatar !== undefined) {
        supabaseProfileData.avatar_url = data.avatar;
      }
      
      supabaseProfileData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(supabaseProfileData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state, preserving extended profile fields
      setUser(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          name: data.name ?? prev.name,
          username: data.username ?? prev.username,
          avatar: data.avatar ?? prev.avatar
        };
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
