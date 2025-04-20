
import { supabase } from '@/integrations/supabase/client';

// Re-export for backward compatibility
export { supabase };

// Helper functions for session persistence
export const persistSession = (session: any) => {
  if (session) {
    localStorage.setItem('supabase_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('supabase_session');
  }
};

export const getPersistedSession = () => {
  const sessionStr = localStorage.getItem('supabase_session');
  return sessionStr ? JSON.parse(sessionStr) : null;
};

// Function to check if we're using a real Supabase client
export const isRealSupabaseClient = () => true;

// Extended profile interface that includes fields we need
export interface ExtendedProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'creator' | 'brand';
  plan: 'free' | 'basic' | 'pro';
  avatar?: string;
  user_metadata?: Record<string, any>;
}
