
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { persistSession, getPersistedSession } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{
    error: any;
    data: any;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any;
    data: any;
  }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<{
    error: any;
    data: any;
  }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ data: null, error: null }),
  signIn: async () => ({ data: null, error: null }),
  logout: async () => {},
  updateProfile: async () => ({ data: null, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
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
          setUser(persistedSession.user ?? null);
        }
        
        // Then check with Supabase
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (supabaseSession) {
          setSession(supabaseSession);
          setUser(supabaseSession.user ?? null);
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
        setUser(newSession.user ?? null);
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

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (!error && data?.user) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
        });
      }
      
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        data: null,
        error,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data?.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      }
      
      return { data, error };
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
        
      return { data: updatedData, error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        data: null,
        error,
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
