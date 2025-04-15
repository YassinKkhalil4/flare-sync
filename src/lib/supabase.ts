
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Initialize the Supabase client with error handling for missing environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the required environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Create a mock client when environment variables are missing (for development)
const createMockClient = () => {
  console.warn('Using mock Supabase client. Some features will not work.');
  // Return a minimal mock client that won't throw errors on initialization
  const mockClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signIn: async () => ({ data: null, error: new Error('Mock client - authentication not available') }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      neq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null })
    })
  };
  return mockClient as unknown as ReturnType<typeof createClient<Database>>;
};

// Create either a real or mock client based on environment variables
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Export a function to check if we're using a real Supabase client
export const isRealSupabaseClient = () => Boolean(supabaseUrl && supabaseAnonKey);
