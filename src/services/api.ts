
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences, NotificationType } from '@/types/notification';
import { ContentPost, ContentTag, ContentApproval, ContentStatus, SocialPlatform } from '@/types/content';
import { SocialProfile, Conversation, Message, MessageRequest } from '@/types/messaging';
import { MessagingAPI } from './messagingService';
import { NotificationService } from './notificationService';
import { ContentAPI } from './contentService';
import { SocialAPI } from './socialService';
import { DealsAPI } from './dealsService';

// Export all services
export { 
  MessagingAPI as MessagingService,
  NotificationService,
  ContentAPI as ContentService,
  SocialAPI as SocialService,
  DealsAPI
};
