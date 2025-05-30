
import { supabase } from '@/integrations/supabase/client';
import { ScheduledPost } from '@/types/database';

export const scheduledPostService = {
  // Get all scheduled posts for a user
  getScheduledPosts: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data as ScheduledPost[];
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      throw error;
    }
  },
  
  // Get a single scheduled post by ID
  getScheduledPost: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (error) throw error;
      return data as ScheduledPost;
    } catch (error) {
      console.error('Error fetching scheduled post:', error);
      throw error;
    }
  },
  
  // Create a new scheduled post
  createScheduledPost: async (post: Partial<ScheduledPost>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(post)
        .select()
        .single();
      
      if (error) throw error;
      return data as ScheduledPost;
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      throw error;
    }
  },
  
  // Update an existing scheduled post
  updateScheduledPost: async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ScheduledPost;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw error;
    }
  },
  
  // Delete a scheduled post
  deleteScheduledPost: async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw error;
    }
  },
  
  // Cancel a scheduled post (mark as cancelled without deleting)
  cancelScheduledPost: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ScheduledPost;
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      throw error;
    }
  },
  
  // Reschedule a post for a new time
  reschedulePost: async (postId: string, newScheduledTime: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({ 
          scheduled_for: newScheduledTime,
          status: 'scheduled'
        })
        .eq('id', postId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ScheduledPost;
    } catch (error) {
      console.error('Error rescheduling post:', error);
      throw error;
    }
  },

  // Get posts for a specific date range
  getPostsForDateRange: async (userId: string, startDate: Date, endDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString())
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data as ScheduledPost[];
    } catch (error) {
      console.error('Error fetching posts for date range:', error);
      throw error;
    }
  },

  // Get posts by status
  getPostsByStatus: async (userId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data as ScheduledPost[];
    } catch (error) {
      console.error('Error fetching posts by status:', error);
      throw error;
    }
  }
};
