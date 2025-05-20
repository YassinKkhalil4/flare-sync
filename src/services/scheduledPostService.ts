
import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ScheduledPost } from '@/types/database';

export class ScheduledPostService {
  async schedulePost(post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert([{
        user_id: post.user_id,
        content: post.body || '',
        media_urls: post.media_urls,
        platform: post.platform,
        scheduled_for: post.scheduled_for,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data as ScheduledPost;
  }

  async getScheduledPosts(): Promise<ScheduledPost[]> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data as ScheduledPost[];
  }

  async deleteScheduledPost(id: string) {
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const scheduledPostService = new ScheduledPostService();
