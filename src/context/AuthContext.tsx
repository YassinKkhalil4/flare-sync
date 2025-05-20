import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Profile) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  isLoading: boolean;
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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
			if (session?.user) {
				await getProfile(session.user.id);
			}
      setLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
			if (session?.user) {
				await getProfile(session.user.id);
			} else {
				setProfile(null);
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

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
		setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
				options: {
					data: metadata
				}
      });
      if (error) throw error;
      alert('Check your email for the verification link.');
			setIsLoading(false);
      return data;
    } catch (error: any) {
      alert(error.error_description || error.message);
			setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const updateProfile = async (updates: Profile) => {
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

      setProfile((prevProfile) => ({
        ...prevProfile,
        ...updates,
      }) as Profile);
    } catch (error: any) {
      alert(error.error_description || error.message);
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
		isLoading
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
