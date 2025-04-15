
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';
import { supabase, isRealSupabaseClient } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'brand';
  plan: 'free' | 'pro';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'creator' | 'brand') => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuthStatus();

    if (isRealSupabaseClient()) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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
        setUser({
          id: data.id,
          email: data.email || '',
          name: data.name || 'User',
          role: (data.role === 'brand') ? 'brand' : 'creator',
          plan: data.plan || 'free',
          avatar: data.avatar_url
        });
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
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
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
          await fetchUserProfile(data.user.id);
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
        }
      } else {
        // Mock login for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'demo@flaresync.com' && password === 'password') {
          const mockUser: User = {
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
          // The profile should be created by the database trigger,
          // but we'll set the user state here
          toast({
            title: "Registration successful",
            description: `Welcome to FlareSync, ${name}!`,
          });
          
          // Check if email confirmation is required
          if (data.session) {
            await fetchUserProfile(data.user.id);
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

        const mockUser: User = {
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
