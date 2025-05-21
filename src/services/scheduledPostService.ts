
import { supabase } from '@/integrations/supabase/client';
import { ScheduledPost } from '@/types/database';

export const scheduledPostService = {
  // Get all scheduled posts for a user
  getScheduledPosts: async (userId: string) => {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });
    
    if (error) throw error;
    return data as ScheduledPost[];
  },
  
  // Get a single scheduled post by ID
  getScheduledPost: async (postId: string) => {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    return data as ScheduledPost;
  },
  
  // Create a new scheduled post
  createScheduledPost: async (post: Partial<ScheduledPost>) => {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert(post)
      .select();
    
    if (error) throw error;
    return data[0] as ScheduledPost;
  },
  
  // Update an existing scheduled post
  updateScheduledPost: async (postId: string, updates: Partial<ScheduledPost>) => {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .update(updates)
      .eq('id', postId)
      .select();
    
    if (error) throw error;
    return data[0] as ScheduledPost;
  },
  
  // Delete a scheduled post
  deleteScheduledPost: async (postId: string) => {
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  },
  
  // Cancel a scheduled post (mark as cancelled without deleting)
  cancelScheduledPost: async (postId: string) => {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .update({ status: 'cancelled' })
      .eq('id', postId)
      .select();
    
    if (error) throw error;
    return data[0] as ScheduledPost;
  },
  
  // Reschedule a post for a new time
  reschedulePost: async (postId: string, newScheduledTime: string) => {
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
  }
};
