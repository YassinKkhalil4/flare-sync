import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ContentStatus, ContentTag } from '@/types/content';

class ContentAPI {
  async getPosts(): Promise<ContentPost[]> {
    const { data, error } = await supabase
      .from('content_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
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
    return data;
  }

  async addPost(post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>): Promise<ContentPost> {
    const { data, error } = await supabase
      .from('content_posts')
      .insert([
        { ...post, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePost(id: string, updates: Partial<ContentPost>): Promise<ContentPost> {
    const { data, error } = await supabase
      .from('content_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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

  async addTag(tag: Omit<ContentTag, 'id' | 'created_at'>): Promise<ContentTag> {
     const { data, error } = await supabase
      .from('content_tags')
      .insert([
        { ...tag, created_at: new Date().toISOString() }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPendingApprovals(): Promise<any[]> {
    const { data, error } = await supabase
      .from('content_approvals')
      .select('*, content_posts(*, profiles(*))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
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
        status: 'scheduled',
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
        status: 'rejected',
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
}

export const ContentAPI = new ContentAPI();
