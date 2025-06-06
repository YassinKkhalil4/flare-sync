
import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ScheduledPost } from '@/types/content';
import { errorHandler, apiCall } from '@/utils/errorHandler';

export class EnhancedContentService {
  static async createPostWithTags(
    postData: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>,
    tagIds: string[] = []
  ): Promise<{ data?: ContentPost; error?: string }> {
    return apiCall(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('content_posts')
        .insert({ ...postData, user_id: user.id })
        .select()
        .single();

      if (postError) throw postError;

      // Add tags if provided
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('content_post_tags')
          .insert(tagRelations);

        if (tagError) {
          console.warn('Error adding tags:', tagError);
          // Don't fail the entire operation for tag errors
        }
      }

      return post as ContentPost;
    }, 'createPostWithTags', postData.user_id);
  }

  static async getPostWithTags(postId: string): Promise<{ data?: any; error?: string }> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          content_post_tags!inner(
            content_tags(*)
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Transform the data to include tags array
      const post = {
        ...data,
        tags: data.content_post_tags?.map((relation: any) => relation.content_tags) || []
      };

      return post;
    }, 'getPostWithTags', postId);
  }

  static async getUserPostsWithTags(userId: string): Promise<{ data?: ContentPost[]; error?: string }> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('content_posts')
        .select(`
          *,
          content_post_tags(
            content_tags(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include tags array
      const posts = data?.map(post => ({
        ...post,
        tags: post.content_post_tags?.map((relation: any) => relation.content_tags) || []
      })) || [];

      return posts as ContentPost[];
    }, 'getUserPostsWithTags', userId);
  }

  static async updatePostTags(
    postId: string, 
    tagIds: string[]
  ): Promise<{ success?: boolean; error?: string }> {
    return apiCall(async () => {
      // First, remove existing tags
      const { error: deleteError } = await supabase
        .from('content_post_tags')
        .delete()
        .eq('post_id', postId);

      if (deleteError) throw deleteError;

      // Then add new tags
      if (tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          post_id: postId,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('content_post_tags')
          .insert(tagRelations);

        if (insertError) throw insertError;
      }

      return { success: true };
    }, 'updatePostTags', postId);
  }
}
