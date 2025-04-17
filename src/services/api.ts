
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences } from '@/types/notification';
import { ContentPost, ContentTag, ContentApproval } from '@/types/content';
import { SocialProfile } from '@/types/messaging';

export const MessagingService = {
  // Get all conversations for the current user
  getConversations: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // For now, we'll use mock data since the conversations table might not exist yet
      return [{
        id: 'mock-1',
        partner: {
          id: 'mock-user-1',
          name: 'Mock User',
          avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=mock',
          type: 'user'
        },
        lastMessage: {
          content: 'This is a mock message',
          timestamp: new Date().toISOString(),
          read: true
        },
        unreadCount: 0
      }];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [{
        id: 'mock-1',
        partner: {
          id: 'mock-user-1',
          name: 'Mock User',
          avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=mock',
          type: 'user'
        },
        lastMessage: {
          content: 'This is a mock message due to error fetching real data',
          timestamp: new Date().toISOString(),
          read: true
        },
        unreadCount: 0
      }];
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string) => {
    try {
      // Since messages table doesn't exist yet, return mock data
      return [
        {
          id: 'mock-msg-1',
          sender: 'me',
          content: 'Hello there!',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'mock-msg-2',
          sender: 'mock-user-1',
          content: 'Hi! How can I help you today?',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 'mock-msg-3',
          sender: 'me',
          content: 'I\'m interested in learning more about your services.',
          timestamp: new Date(Date.now() - 3400000).toISOString()
        },
        {
          id: 'mock-msg-4',
          sender: 'mock-user-1',
          content: 'Great! I\'d be happy to tell you more about what we offer.',
          timestamp: new Date(Date.now() - 3300000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a new message
  sendMessage: async ({ conversationId, content }: { conversationId: string, content: string }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // Mock sending a message
      return {
        id: `new-${Date.now()}`,
        sender: 'me',
        content,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Mark a conversation as read
  markAsRead: async (conversationId: string) => {
    try {
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return false;
    }
  }
};

export const NotificationService = {
  // Get all notifications for the current user
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
  
  // Mark a notification as read
  markAsRead: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  // Get notification preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        throw new Error("User authentication required");
      }
      
      const userId = userData.user.id;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }
      
      if (!data) {
        // Create default preferences if none exist
        try {
          const { data: newPreferences, error: insertError } = await supabase
            .from('notification_preferences')
            .insert({
              user_id: userId,
              email_enabled: true,
              push_enabled: true,
              social_events_enabled: true,
              system_alerts_enabled: true,
              approval_requests_enabled: true,
              content_published_enabled: true
            })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newPreferences as NotificationPreferences;
        } catch (err) {
          console.error("Error creating default preferences:", err);
          return null;
        }
      }
      
      return data as NotificationPreferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  },
  
  // Update notification preferences
  updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> => {
    try {
      if (!preferences.user_id) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          preferences.user_id = userData.user.id;
        } else {
          throw new Error("User ID is required for updating preferences");
        }
      }
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', preferences.user_id)
        .select()
        .single();
      
      if (error) throw error;
      return data as NotificationPreferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  },
  
  // Subscribe to real-time notifications
  subscribeToNotifications: (onNewNotification: (notification: Notification) => void) => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Check if this notification is for the current user
          const notification = payload.new as Notification;
          onNewNotification(notification);
        }
      )
      .subscribe();
    
    return channel;
  }
};

export const ContentService = {
  // Get all posts for the current user
  getPosts: async (): Promise<ContentPost[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('content_posts')
        .select('*, tags:content_post_tags(tag_id, content_tags(*))')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include tags
      return data.map(post => {
        const formattedTags = post.tags ? post.tags.map((tagRel: any) => tagRel.content_tags) : [];
        
        return {
          ...post,
          tags: formattedTags
        };
      }) as ContentPost[];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },
  
  // Get a specific post by ID
  getPostById: async (id: string): Promise<ContentPost | null> => {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*, tags:content_post_tags(tag_id, content_tags(*))')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform tags data
      const formattedTags = data.tags ? data.tags.map((tagRel: any) => tagRel.content_tags) : [];
      
      return {
        ...data,
        tags: formattedTags
      } as ContentPost;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  // Get approvals for a specific post
  getPostApprovals: async (postId: string): Promise<ContentApproval[]> => {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*, profiles(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as ContentApproval[];
    } catch (error) {
      console.error('Error fetching post approvals:', error);
      return [];
    }
  },
  
  // Create a new post
  createPost: async (postData: Partial<ContentPost>, tagIds: string[]): Promise<ContentPost | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // Insert the post
      const { data: newPost, error } = await supabase
        .from('content_posts')
        .insert({
          ...postData,
          user_id: user.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add tags if provided
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: newPost.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('content_post_tags')
          .insert(tagRelations);
          
        if (tagError) console.error('Error adding tags to post:', tagError);
      }
      
      // Get the complete post with tags
      return await this.getPostById(newPost.id);
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },
  
  // Update an existing post
  updatePost: async (id: string, postData: Partial<ContentPost>, tagIds: string[]): Promise<ContentPost | null> => {
    try {
      // Update the post
      const { error } = await supabase
        .from('content_posts')
        .update(postData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove existing tag relations
      const { error: deleteError } = await supabase
        .from('content_post_tags')
        .delete()
        .eq('post_id', id);
        
      if (deleteError) throw deleteError;
      
      // Add new tag relations
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('content_post_tags')
          .insert(tagRelations);
          
        if (tagError) throw tagError;
      }
      
      // Get the updated post with tags
      return await this.getPostById(id);
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  },
  
  // Delete a post
  deletePost: async (id: string): Promise<boolean> => {
    try {
      // First delete tag relations
      await supabase
        .from('content_post_tags')
        .delete()
        .eq('post_id', id);
        
      // Then delete the post
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },
  
  // Get all content tags
  getTags: async (): Promise<ContentTag[]> => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data as ContentTag[];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },
  
  // Create a new tag
  createTag: async (name: string): Promise<ContentTag | null> => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as ContentTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  },
  
  // Get pending content approvals
  getPendingApprovals: async (): Promise<ContentApproval[]> => {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*, content_posts(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as ContentApproval[];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  },
  
  // Update approval status
  updateApproval: async (approvalId: string, status: string, notes?: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // Update approval status
      const { error } = await supabase
        .from('content_approvals')
        .update({
          status,
          notes,
          approver_id: user.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating approval:', error);
      return false;
    }
  }
};

export const SocialService = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // For now, return mock data
      return [
        {
          id: 'instagram-1',
          platform: 'instagram',
          username: 'instagramuser',
          profileUrl: 'https://instagram.com/instagramuser',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 1200,
            posts: 45,
            engagement: 3.5
          }
        },
        {
          id: 'tiktok-1',
          platform: 'tiktok',
          username: 'tiktokuser',
          connected: false
        },
        {
          id: 'youtube-1',
          platform: 'youtube',
          username: 'youtubeuser',
          connected: false
        },
        {
          id: 'twitter-1',
          platform: 'twitter',
          username: 'twitteruser',
          connected: false
        }
      ];
    } catch (error) {
      console.error('Error fetching social profiles:', error);
      return [];
    }
  },
  
  // Connect a social platform
  connectPlatform: async (platform: string, code: string, state: string): Promise<SocialProfile> => {
    try {
      // Would call the appropriate edge function for authentication
      // For now, return mock data
      return {
        id: `${platform}-1`,
        platform: platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch',
        username: `${platform}user`,
        profileUrl: `https://${platform}.com/${platform}user`,
        connected: true,
        lastSynced: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      throw error;
    }
  },
  
  // Disconnect a social platform
  disconnectPlatform: async (profileId: string): Promise<boolean> => {
    try {
      // Would implement real logic to disconnect
      return true;
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      throw error;
    }
  },
  
  // Sync data from a social platform
  syncPlatform: async (profileId: string): Promise<SocialProfile> => {
    try {
      // Would call the appropriate edge function for syncing
      // For now, return mock data
      return {
        id: profileId,
        platform: 'instagram',
        username: 'instagramuser',
        profileUrl: 'https://instagram.com/instagramuser',
        connected: true,
        lastSynced: new Date().toISOString(),
        stats: {
          followers: 1250, // Updated stats
          posts: 46,
          engagement: 3.6
        }
      };
    } catch (error) {
      console.error('Error syncing platform:', error);
      throw error;
    }
  }
};

export const BrandDealsService = {
  // Get all deals for the current user
  getDeals: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // For now, return mock data
      return [
        {
          id: 'deal-1',
          title: 'Instagram Promotion',
          brand: {
            id: 'brand-1',
            name: 'Eco Friendly Co.',
            logo: 'https://api.dicebear.com/6.x/initials/svg?seed=EF'
          },
          status: 'pending',
          compensation: 1500,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Promote our new eco-friendly product line with 3 Instagram posts.',
          requirements: ['3 posts over 2 weeks', 'Minimum 10% engagement rate']
        },
        {
          id: 'deal-2',
          title: 'Video Review',
          brand: {
            id: 'brand-2',
            name: 'Tech Gadgets Inc',
            logo: 'https://api.dicebear.com/6.x/initials/svg?seed=TG'
          },
          status: 'accepted',
          compensation: 2500,
          expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Create a detailed video review of our latest smartphone.',
          requirements: ['10+ minute video', '30 day exclusivity period']
        }
      ];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }
};

export const ProfileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  // Update user profile
  updateProfile: async (profileData: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Upload avatar
  uploadAvatar: async (file: File) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('user-content')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('user-content')
        .getPublicUrl(filePath);
      
      // Update profile with avatar URL
      await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
};
