
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  avatar_url?: string;
  full_name?: string;
  username?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: any;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (details: { email: string; password: string; fullName: string; username: string; role: 'creator' | 'brand' }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profileData: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
  externalLandingPageUrl?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, externalLandingPageUrl = 'https://flaresync.org' }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
      }
      
      if (session?.user) {
        setUser(session.user);
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            window.location.href = externalLandingPageUrl;
          } else if (event === 'USER_UPDATED' && session?.user) {
            setUser(session.user);
          }
        }
      );
      
      setIsLoading(false);
      
      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, [externalLandingPageUrl, navigate]);

  // Sign in method
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        toast({
          title: "Signed in successfully",
          description: "Welcome back to FlareSync!",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Failed to sign in. Please try again.",
      });
      throw error;
    }
  };

  // Sign up method
  const signUp = async ({ 
    email, 
    password, 
    fullName, 
    username, 
    role 
  }: { 
    email: string; 
    password: string;
    fullName: string;
    username: string; 
    role: 'creator' | 'brand';
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            role
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        toast({
          title: "Account created successfully",
          description: "Welcome to FlareSync! Let's set up your profile.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Failed to create an account. Please try again.",
      });
      throw error;
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      // Redirect to landing page
      window.location.href = externalLandingPageUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData: UserProfile) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
