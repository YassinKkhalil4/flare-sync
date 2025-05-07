
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences, NotificationType } from '@/types/notification';
import { ContentPost, ContentTag, ContentApproval, ContentStatus, SocialPlatform } from '@/types/content';
import { SocialProfile, Conversation, Message, MessageRequest } from '@/types/messaging';
import { MessagingAPI } from './messagingService';
import { NotificationService } from './notificationService';
import { ContentAPI } from './contentService';
import { SocialAPI } from './socialService';
import { dealsService } from './dealsService';

// AI Services
export const aiServices = {
  captionGenerator: {
    generateCaptions: async (params: any) => {
      const { data: sessionData } = await supabase.auth.getSession();
      return supabase.functions.invoke('generate-captions', {
        body: params,
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });
    }
  },
  engagementPredictor: {
    predictEngagement: async (params: any) => {
      const { data: sessionData } = await supabase.auth.getSession();
      return supabase.functions.invoke('predict-engagement', {
        body: params,
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });
    }
  },
  brandMatchmaker: {
    findBrandMatches: async (params: any) => {
      const { data: sessionData } = await supabase.auth.getSession();
      return supabase.functions.invoke('brand-matchmaker', {
        body: params,
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });
    }
  },
  contentPlanGenerator: {
    generateContentPlan: async (params: any) => {
      const { data: sessionData } = await supabase.auth.getSession();
      return supabase.functions.invoke('generate-content-plan', {
        body: params,
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });
    }
  }
};

// Export all services
export { 
  MessagingAPI as MessagingService,
  NotificationService,
  ContentAPI as ContentService,
  SocialAPI as SocialService,
  dealsService
};
