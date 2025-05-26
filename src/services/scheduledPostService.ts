import { supabase } from '@/integrations/supabase/client';
import { ScheduledPost } from '@/types/database';

export const scheduledPostService = {
  // Get all scheduled posts for a user
  getScheduledPosts: async (userId: string) => {
    try {
      const { count, error: countError } = await supabase
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .limit(1);
        
      if (countError || count === 0) {
        // If there's an error or no data, return empty array
        return [];
      }
      
      // Otherwise, get real data
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data as ScheduledPost[];
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      return [];
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
      return null;
    }
  },
  
  // Create a new scheduled post
  createScheduledPost: async (post: Partial<ScheduledPost>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert(post)
        .select();
      
      if (error) throw error;
      return data[0] as ScheduledPost;
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      return null;
    }
  },
  
  // Update an existing scheduled post
  updateScheduledPost: async (postId: string, updates: Partial<ScheduledPost>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', postId)
        .select();
      
      if (error) throw error;
      return data[0] as ScheduledPost;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      return null;
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
      return false;
    }
  },
  
  // Cancel a scheduled post (mark as cancelled without deleting)
  cancelScheduledPost: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId)
        .select();
      
      if (error) throw error;
      return data[0] as ScheduledPost;
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      return null;
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
        .select();
      
      if (error) throw error;
      return data[0] as ScheduledPost;
    } catch (error) {
      console.error('Error rescheduling post:', error);
      return null;
    }
  }
};
