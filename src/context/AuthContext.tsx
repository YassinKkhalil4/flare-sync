
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Session,
  User as SupabaseUser,
  AuthChangeEvent,
} from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProfile, mapDatabaseProfileToExtended } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: ExtendedProfile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (credentials: any) => Promise<any>;
  signIn: (credentials: any) => Promise<any>;
  signOut: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  updateProfile: (data: any) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
  externalLandingPageUrl?: string;
}

export const AuthProvider = ({ children, externalLandingPageUrl = "https://flaresync.org" }: Props) => {
  const [user, setUser] = useState<ExtendedProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);

      if (session) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    loadSession();

    // Listen for changes on auth state (logout, sign in, register)
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    setIsLoading(true);
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select(`id, full_name, username, avatar_url, role, plan`)
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        throw error;
      }

      if (profile) {
        const extendedProfile = mapDatabaseProfileToExtended(profile, supabaseUser.email || '');
        setUser(extendedProfile);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch user profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: any) => {
    // For the implementation with external landing page,
    // registration should be typically done on the landing page
    // This method remains for direct signups if needed
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            username: credentials.username,
            role: credentials.role
          }
        }
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      await fetchUserProfile(data.user);

      toast({
        title: "Success",
        description: "Account created successfully.",
      });

      return data;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      await fetchUserProfile(data.user);

      toast({
        title: "Success",
        description: "Signed in successfully.",
      });

      return data;
    } catch (error: any) {
      console.error("Signin error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);

      toast({
        title: "Success",
        description: "Signed out successfully.",
      });
      
      // Redirect to external landing page
      window.location.href = externalLandingPageUrl;
    } catch (error: any) {
      console.error("Signout error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) return null;
      
      // Ensure the file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB.',
          variant: 'destructive'
        });
        return null;
      }
      
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast({
          title: 'Upload failed',
          description: 'Could not upload avatar. Please try again.',
          variant: 'destructive'
        });
        return null;
      }
      
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update user profile with new avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast({
          title: 'Update failed',
          description: 'Could not update profile. Please try again.',
          variant: 'destructive'
        });
        return null;
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, avatar: publicUrl.publicUrl } : null);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Upload error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          username: data.username,
        })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      setUser((prev) =>
        prev ? { ...prev, name: data.name, username: data.username } : null
      );

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      console.error("Update profile error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.log('Error refreshing session:', error)
    } else {
      setSession(data.session)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        uploadAvatar,
        updateProfile,
        sendPasswordResetEmail,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
