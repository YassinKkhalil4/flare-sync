
import { MessagingAPI } from './messagingService';
import { SocialAPI } from './socialService';
import { isRealSupabaseClient } from '../lib/supabase';

// Determine which API implementation to use
const useRealApi = isRealSupabaseClient();

// Export the services
export const MessagingService = MessagingAPI;
export const SocialService = SocialAPI;

// Export a helper function to check if we're using the real API
export const isUsingRealApi = () => useRealApi;
