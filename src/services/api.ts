
import { MessagingAPI } from './messagingService';
import { SocialAPI } from './socialService';
import { isRealSupabaseClient } from '../lib/supabase';

// Determine which API implementation to use
let useRealApi = isRealSupabaseClient();

// Override for development environments that want to use the mock API
if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
  useRealApi = false;
}

// Export the services
export const MessagingService = MessagingAPI;
export const SocialService = SocialAPI;
