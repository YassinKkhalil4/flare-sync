
import { supabase } from '@/integrations/supabase/client';

export const ContentAPI = {
  async addPost(post: any) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  },
  
  async deletePost(id: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
  
  async getPosts() {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getPostById(id: string) {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  async updatePost(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .select(`
          *,
          content_posts!inner (
            id,
            title,
            body,
            platform,
            media_urls,
            created_at
          ),
          profiles:approver_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  },

  async updateApproval(id: string, status: 'approved' | 'rejected', feedback?: string) {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .update({ 
          status,
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating approval:', error);
      throw error;
    }
  }
};

export const ContentService = {
  async getPosts() {
    return ContentAPI.getPosts();
  },

  async getPostById(id: string) {
    return ContentAPI.getPostById(id);
  },

  async createPost(post: any) {
    return ContentAPI.addPost(post);
  },

  async updatePost(id: string, updates: any) {
    return ContentAPI.updatePost(id, updates);
  },

  async deletePost(id: string) {
    return ContentAPI.deletePost(id);
  }
};

export const NotificationService = {
  async getNotificationPreferences() {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {
        email_enabled: true,
        push_enabled: true,
        social_events_enabled: true,
        system_alerts_enabled: true,
        approval_requests_enabled: true,
        content_published_enabled: true
      };
    }
  },

  async updateNotificationPreferences(preferences: any) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...preferences
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  async getPreferences() {
    return this.getNotificationPreferences();
  },

  async updatePreferences(preferences: any) {
    return this.updateNotificationPreferences(preferences);
  }
};

export const SocialService = {
  async getConnectedPlatforms() {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching social platforms:', error);
      return [];
    }
  },

  async getProfiles() {
    return this.getConnectedPlatforms();
  },

  async connectPlatform(platform: string) {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          platform,
          username: `connecting_${platform}`,
          connected: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error connecting platform:', error);
      throw error;
    }
  },

  async disconnectPlatform(platformId: string) {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .delete()
        .eq('id', platformId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      throw error;
    }
  },

  async syncPlatform(platformId: string) {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', platformId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing platform:', error);
      throw error;
    }
  }
};

export const MessagingService = {
  async getConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(messageRequest: { conversationId: string; content: string }) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageRequest.conversationId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content: messageRequest.content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(messageId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  async createConversation(partnerData: { id: string; name: string; avatar: string; type: string }) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          partner_id: partnerData.id,
          partner_name: partnerData.name,
          partner_avatar: partnerData.avatar,
          partner_type: partnerData.type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
};
