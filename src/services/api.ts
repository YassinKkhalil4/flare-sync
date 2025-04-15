
import { MessagingAPI } from './messagingService';
import { SocialAPI } from './socialService';
import { DealsAPI } from './dealsService';
import { isRealSupabaseClient } from '../lib/supabase';

// Determine which API implementation to use
const useRealApi = isRealSupabaseClient();

// Export the services
export const MessagingService = MessagingAPI;
export const SocialService = SocialAPI;
export const DealsService = DealsAPI;

// Export a helper function to check if we're using the real API
export const isUsingRealApi = () => useRealApi;
