
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { SignInCredentials, SignUpCredentials } from '@/utils/authHelpers';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<any>;
  isLoading: boolean;
  isAdmin: boolean;
  uploadAvatar: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await getProfile(session.user.id);
        await checkAdminRole(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await getProfile(session.user.id);
        await checkAdminRole(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
  }, []);

  const getProfile = async (userId: string) => {
    try {
      let { data, error, status } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', userId)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error: any) {
      console.log(error.message)
    }
  }

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin role:', error);
        return;
      }

      setIsAdmin(!!data);
    } catch (error: any) {
      console.error('Error checking admin role:', error);
    }
  };

  const signIn = async (credentials: SignInCredentials) => {
    try {
      const { email, password } = credentials;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data?.user) {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      }
      
      return { data };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    try {
      const { email, password, options } = credentials;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Check your email for the verification link.",
      });
      
      setIsLoading(false);
      return data;
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
      
      setIsLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      // Update the local profile state
      setProfile((prevProfile) => ({
        ...prevProfile,
        ...updates,
      }) as Profile);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update the local profile state
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar_url: publicUrl,
      }) as Profile);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.error_description || error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile,
    signUp,
    isLoading,
    isAdmin,
    uploadAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
