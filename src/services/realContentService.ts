
import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ScheduledPost } from '@/types/content';

export class RealContentService {
  static async createPost(postData: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPost> {
    const { data, error } = await supabase
      .from('content_posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePost(id: string, postData: Partial<ContentPost>): Promise<ContentPost> {
    const { data, error } = await supabase
      .from('content_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getUserPosts(userId: string): Promise<ContentPost[]> {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async schedulePost(postData: Omit<ScheduledPost, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledPost> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async publishPost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('publish-post', {
        body: { postId: id }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
