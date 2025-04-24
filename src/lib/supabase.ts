
import { supabase } from '@/integrations/supabase/client';

// Re-export for backward compatibility
export { supabase };

// Helper functions for session persistence
export const persistSession = (session: any) => {
  if (session) {
    try {
      localStorage.setItem('supabase_session', JSON.stringify(session));
      console.log("Session persisted to localStorage");
    } catch (error) {
      console.error("Error persisting session:", error);
    }
  } else {
    try {
      localStorage.removeItem('supabase_session');
      console.log("Session removed from localStorage");
    } catch (error) {
      console.error("Error removing session:", error);
    }
  }
};

export const getPersistedSession = () => {
  try {
    const sessionStr = localStorage.getItem('supabase_session');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    console.log("Retrieved persisted session from localStorage");
    return session;
  } catch (error) {
    console.error("Error retrieving persisted session:", error);
    return null;
  }
};

// Function to check if we're using a real Supabase client
export const isRealSupabaseClient = () => true;

// Define plan type
export type UserPlan = 'free' | 'basic' | 'pro';

// Extended profile interface that includes fields we need
export interface ExtendedProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'creator' | 'brand';
  plan: UserPlan;
  avatar?: string;
  user_metadata?: Record<string, any>;
}

// Function to ensure plan is one of the allowed values
export const ensureValidPlan = (plan: string): UserPlan => {
  if (plan === 'basic' || plan === 'pro') {
    return plan;
  }
  return 'free'; // Default to free for any invalid value
};

// Function to convert database profile to extended profile
export const mapDatabaseProfileToExtended = (dbProfile: any, email: string = ''): ExtendedProfile => {
  return {
    id: dbProfile.id,
    email: email,
    name: dbProfile.full_name || 'User',
    username: dbProfile.username || '',
    role: dbProfile.role || 'creator',
    plan: ensureValidPlan(dbProfile.plan || 'free'),
    avatar: dbProfile.avatar_url,
    user_metadata: {}
  };
};
