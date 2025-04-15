
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Use direct values from the project's Supabase instance
const supabaseUrl = 'https://orqsqrtubaxeopnzbtgs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycXNxcnR1YmF4ZW9wbnpidGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDczOTQsImV4cCI6MjA2MDI4MzM5NH0.CRX01GklnQ-xnl7pgrZSXUhlTutqeymbjjGK6O8WsGs';

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Function to check if we're using a real Supabase client
export const isRealSupabaseClient = () => true;

// Function to persist session in localStorage for better offline support
export const persistSession = (session: any) => {
  if (session) {
    localStorage.setItem('supabase_session', JSON.stringify(session));
  } else {
    localStorage.removeItem('supabase_session');
  }
};

// Function to get persisted session
export const getPersistedSession = () => {
  const sessionStr = localStorage.getItem('supabase_session');
  return sessionStr ? JSON.parse(sessionStr) : null;
};
