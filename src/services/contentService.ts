
import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ScheduledPost } from '@/types/content';
import { useToast } from '@/hooks/use-toast';

export class ContentAPI {
  static async createPost(data: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>, tagIds?: string[]): Promise<ContentPost | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const postData = {
        ...data,
        user_id: user.id,
      };

      const { data: post, error } = await supabase
        .from('content_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('content_post_tags')
          .insert(tagRelations);

        if (tagError) console.error('Error adding tags:', tagError);
      }

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  static async schedulePost(data: Omit<ScheduledPost, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const scheduledData = {
        ...data,
        user_id: user.id,
        status: 'scheduled'
      };

      const { error } = await supabase
        .from('scheduled_posts')
        .insert(scheduledData);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  static async publishPost(postId: string, platform: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session');

      let functionName = '';
      switch (platform) {
        case 'instagram':
          functionName = 'post-to-instagram';
          break;
        case 'twitter':
          functionName = 'post-to-twitter';
          break;
        case 'tiktok':
          functionName = 'post-to-tiktok';
          break;
        case 'youtube':
          functionName = 'post-to-youtube';
          break;
        default:
          throw new Error(`Publishing to ${platform} not supported yet`);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { postId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  static async getScheduledPosts(): Promise<ScheduledPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      return [];
    }
  }

  static async updatePostStatus(postId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status })
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating post status:', error);
      return false;
    }
  }
}
