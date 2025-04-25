
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  supabase, 
  getPersistedSession, 
  persistSession, 
  ExtendedProfile, 
  mapDatabaseProfileToExtended,
  ensureValidPlan
} from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate, NavigateFunction } from 'react-router-dom';

// Create a context to store the navigate function
const NavigationContext = createContext<NavigateFunction | undefined>(undefined);

// Custom hook to access the navigate function
export const useCustomNavigate = () => {
  const navigate = useContext(NavigationContext);
  if (!navigate) {
    // This error will only occur if useCustomNavigate is used outside NavigationProvider
    console.error('useCustomNavigate must be used within a NavigationProvider');
    return () => {}; // Return a dummy function to avoid breaking the app
  }
  return navigate;
};

// Provider component for navigation
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <NavigationContext.Provider value={navigate}>
      {children}
    </NavigationContext.Provider>
  );
};

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
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to fetch user profile data
  const fetchUserProfile = async (userId: string, userEmail: string | null = null) => {
    try {
      // Fetch the profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle cases where profile doesn't exist yet

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which we handle below
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Fetch role data
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single

      if (roleError && roleError.code !== 'PGRST116') {
        console.error("Role fetch error:", roleError);
      }

      // If profile doesn't exist yet, create basic profile data
      const basicProfile = {
        id: userId,
        email: userEmail || '',
        name: '',
        username: '',
        role: (roleData?.role as 'creator' | 'brand') || 'creator', // Default to creator if no role
        plan: 'free' as const
      };
      
      // Create extended profile with profile data or fallback to basic profile
      const extendedProfile = profile 
        ? mapDatabaseProfileToExtended(profile, userEmail || '')
        : basicProfile;
      
      if (roleData?.role) {
        extendedProfile.role = roleData.role as 'creator' | 'brand';
      }
      
      return extendedProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Return basic profile if fetch fails
      return {
        id: userId,
        email: userEmail || '',
        name: '',
        username: '',
        role: 'creator' as const, // Default to creator if fetch fails
        plan: 'free' as const
      };
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        console.log("Loading session...");
        // Check persisted session
        const persistedSession = getPersistedSession();
        if (persistedSession) {
          console.log("Found persisted session, setting it");
          await supabase.auth.setSession(persistedSession);
        }

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session ? "exists" : "none");

        if (session) {
          try {
            const extendedProfile = await fetchUserProfile(session.user.id, session.user.email);
            setUser(extendedProfile);
          } catch (error) {
            console.error("Error loading profile:", error);
            // Set basic user info if profile fetch fails
            const basicProfile: ExtendedProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || 'User',
              username: session.user.user_metadata?.username || '',
              role: (session.user.user_metadata?.role as 'creator' | 'brand') || 'creator',
              plan: ensureValidPlan(session.user.user_metadata?.plan || 'free')
            };
            setUser(basicProfile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        persistSession(session);
      } else if (event === 'SIGNED_OUT') {
        persistSession(null);
      }

      if (event === 'INITIAL_SESSION') {
        // Skip initial session event, already handled
        return;
      }

      if (session) {
        try {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            try {
              const extendedProfile = await fetchUserProfile(session.user.id, session.user.email);
              setUser(extendedProfile);
            } catch (error) {
              console.error('Error fetching profile on auth change:', error);
              // Set basic user info if profile fetch fails
              const basicProfile: ExtendedProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || 'User',
                username: session.user.user_metadata?.username || '',
                role: (session.user.user_metadata?.role as 'creator' | 'brand') || 'creator',
                plan: ensureValidPlan(session.user.user_metadata?.plan || 'free')
              };
              setUser(basicProfile);
            }
          }, 0);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Logging in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      if (data.session) {
        console.log("Login successful, fetching profile");
        persistSession(data.session);
        
        try {
          const extendedProfile = await fetchUserProfile(data.session.user.id, data.session.user.email);
          setUser(extendedProfile);
          
          toast({
            title: "Login successful",
            description: "You have successfully logged in."
          });
          
          navigate('/dashboard');
        } catch (error) {
          console.error("Error processing profile after login:", error);
          toast({
            title: "Login issue",
            description: "Logged in but couldn't fetch your profile. Some features may be limited.",
            variant: "destructive"
          });
          throw error;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
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
        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              username: username,
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }

        // Insert into user_roles table with the actual role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            {
              user_id: data.user.id,
              role: role
            }
          ]);

        if (roleError) {
          console.error("Error setting user role:", roleError);
          // We'll continue even if role assignment fails to avoid blocking signup
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
        extendedProfile.role = role;
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
        description: error instanceof Error ? error.message : "Could not create your account. Please try again.",
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
