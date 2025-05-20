
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { SignInCredentials, SignUpCredentials, cleanupAuthState } from '@/utils/authHelpers';
import { setCookie, getCookie, getEncryptedCookie } from '@/utils/cookies';

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

// Cookie names
const SESSION_COOKIE_NAME = 'supabase_session';
const SESSION_EXPIRY_DAYS = 30;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const persistSession = (sessionData: any) => {
    if (sessionData) {
      // Store in local storage for redundancy
      try {
        localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(sessionData));
      } catch (err) {
        console.error('Failed to store session in localStorage:', err);
      }
      
      // Store in cookies for cross-tab persistence
      setCookie(SESSION_COOKIE_NAME, JSON.stringify(sessionData), SESSION_EXPIRY_DAYS);
    } else {
      // Clear session
      localStorage.removeItem(SESSION_COOKIE_NAME);
      setCookie(SESSION_COOKIE_NAME, '', -1); // Expire the cookie
    }
  };

  const retrieveSessionFromStorage = async () => {
    // Try to get session from cookies first
    const sessionCookie = await getEncryptedCookie(SESSION_COOKIE_NAME);
    
    if (sessionCookie) {
      try {
        return JSON.parse(sessionCookie);
      } catch (err) {
        console.error('Failed to parse session cookie:', err);
      }
    }
    
    // Fall back to localStorage
    try {
      const sessionData = localStorage.getItem(SESSION_COOKIE_NAME);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (err) {
      console.error('Failed to retrieve session from localStorage:', err);
    }
    
    return null;
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        // First check for session in Supabase auth
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no session from Supabase, try to get from our storage
        if (!session) {
          const storedSession = await retrieveSessionFromStorage();
          if (storedSession) {
            // If we have a stored session, try to refresh it
            const { data } = await supabase.auth.setSession({
              access_token: storedSession.access_token,
              refresh_token: storedSession.refresh_token
            });
            
            if (data.session) {
              setSession(data.session);
              setUser(data.session.user);
              persistSession(data.session);
              await getProfile(data.session.user.id);
              await checkAdminRole(data.session.user.id);
              setLoading(false);
              return;
            } else {
              // If session refresh fails, clean up
              cleanupAuthState();
              persistSession(null);
            }
          }
        } else {
          // We have a valid session from Supabase
          setSession(session);
          setUser(session.user);
          persistSession(session);
          await getProfile(session.user.id);
          await checkAdminRole(session.user.id);
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        persistSession(session);
        // Use setTimeout to prevent potential deadlocks with Supabase client
        setTimeout(async () => {
          await getProfile(session.user.id);
          await checkAdminRole(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        persistSession(null);
      }
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
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
      // Clean up any existing auth state first
      cleanupAuthState();
      
      const { email, password } = credentials;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data?.session) {
        persistSession(data.session);
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
      // Clean up any existing auth state first
      cleanupAuthState();
      
      const { email, password, options } = credentials;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) throw error;
      
      if (data?.session) {
        persistSession(data.session);
      }
      
      toast({
        title: "Sign up successful",
        description: "Your account has been created.",
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
      // Clear stored sessions first
      persistSession(null);
      cleanupAuthState();
      
      // Then sign out from Supabase 
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Force a page reload to ensure clean state
      window.location.href = '/login';
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
