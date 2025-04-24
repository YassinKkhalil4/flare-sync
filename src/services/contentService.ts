import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ContentStatus, ContentTag, ContentApproval } from '@/types/content';
import { scheduledPostService } from './scheduledPostService';

export class ContentAPIClass {
  async getPosts(): Promise<ContentPost[]> {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as ContentPost[];
  }

  async getPostById(id: string): Promise<ContentPost | null> {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching post by ID:", error);
      return null;
    }
    return data as ContentPost;
  }

  async createPost(post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>, tagIds?: string[]): Promise<ContentPost> {
    // Ensure required fields are present
    if (!post.title || !post.platform || !post.status) {
      throw new Error("Missing required fields: title, platform, and status are required");
    }
    
    const { data, error } = await supabase
      .from('content_posts')
      .insert([
        { ...post, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // If tagIds are provided, create post-tag associations
    if (tagIds && tagIds.length > 0 && data) {
      const tagAssociations = tagIds.map(tagId => ({
        post_id: data.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('content_post_tags')
        .insert(tagAssociations);
      
      if (tagError) {
        console.error("Error associating tags with post:", tagError);
      }
    }
    
    return data as ContentPost;
  }

  async updatePost(id: string, updates: Partial<ContentPost>, tagIds?: string[]): Promise<ContentPost> {
    const { data, error } = await supabase
      .from('content_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If tagIds are provided, update post-tag associations
    if (tagIds !== undefined) {
      // First, remove all existing associations
      const { error: deleteError } = await supabase
        .from('content_post_tags')
        .delete()
        .eq('post_id', id);
      
      if (deleteError) {
        console.error("Error removing existing tag associations:", deleteError);
      }
      
      // Then, add the new ones
      if (tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));
        
        const { error: insertError } = await supabase
          .from('content_post_tags')
          .insert(tagAssociations);
        
        if (insertError) {
          console.error("Error associating tags with post:", insertError);
        }
      }
    }
    
    return data as ContentPost;
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getTags(): Promise<ContentTag[]> {
    const { data, error } = await supabase
      .from('content_tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createTag(name: string): Promise<ContentTag> {
     const { data, error } = await supabase
      .from('content_tags')
      .insert([
        { name, created_at: new Date().toISOString() }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as ContentTag;
  }

  async getPostApprovals(postId: string): Promise<ContentApproval[]> {
    const { data, error } = await supabase
      .from('content_approvals')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as ContentApproval[];
  }

  async getPendingApprovals(): Promise<ContentApproval[]> {
    const { data, error } = await supabase
      .from('content_approvals')
      .select('*, content_posts(*, profiles(*))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as ContentApproval[];
  }

  async updateApproval(approvalId: string, status: 'approved' | 'rejected', notes?: string) {
    // Fetch the approval record first to get related post info
    const { data: approval, error: fetchError } = await supabase
      .from('content_approvals')
      .select('*, content_posts(*)')
      .eq('id', approvalId)
      .single();

    if (fetchError) throw fetchError;

    // Update the approval record
    const { error } = await supabase
      .from('content_approvals')
      .update({
        status: status,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (error) throw error;

    // If approval was successful, update the post status
    if (status === 'approved' && approval?.content_posts) {
      const post = approval.content_posts;
      
      await this.updatePost(post.id, {
        status: 'scheduled' as ContentStatus,
        reviewer_id: approval.approver_id,
        reviewer_notes: notes
      });

      // Send notification to content creator
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            userId: post.user_id,
            type: 'approval_request',
            title: 'Content Approved',
            message: `Your post "${post.title}" has been approved and scheduled for publishing.`,
            relatedEntityType: 'content_post',
            relatedEntityId: post.id
          }
        });
      } catch (notificationError) {
        console.error('Failed to send approval notification:', notificationError);
      }
    } else if (status === 'rejected' && approval?.content_posts) {
      const post = approval.content_posts;
      
      await this.updatePost(post.id, {
        status: 'rejected' as ContentStatus,
        reviewer_id: approval.approver_id,
        reviewer_notes: notes
      });

      // Send notification to content creator
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            userId: post.user_id,
            type: 'approval_request',
            title: 'Content Rejected',
            message: `Your post "${post.title}" was rejected. Please review the feedback and make necessary changes.`,
            relatedEntityType: 'content_post',
            relatedEntityId: post.id
          }
        });
      } catch (notificationError) {
        console.error('Failed to send rejection notification:', notificationError);
      }
    }
  }

  async schedulePost(post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPost> {
    // First create the content post
    const contentPost = await this.createPost(post);
    
    // Then schedule it
    await scheduledPostService.schedulePost(post);
    
    return contentPost;
  }
}

// Create and export a singleton instance
export const ContentAPI = new ContentAPIClass();
