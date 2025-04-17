
import { ContentPost, ContentTag, ContentApprovalFlow, ContentApproval } from '../types/content';
import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

export const ContentAPI = {
  // Posts
  getPosts: async (): Promise<ContentPost[]> => {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*, content_post_tags(*, content_tags(*))');
      
      if (error) throw error;

      // Transform the result to match our ContentPost interface with tags
      return data.map(post => {
        const tags = post.content_post_tags?.map(pt => pt.content_tags) || [];
        return {
          ...post,
          tags
        };
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch content posts',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  getPostById: async (id: string): Promise<ContentPost | null> => {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*, content_post_tags(*, content_tags(*))')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const tags = data.content_post_tags?.map(pt => pt.content_tags) || [];
      return {
        ...data,
        tags
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch content post',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  createPost: async (post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>, tagIds: string[] = []): Promise<ContentPost | null> => {
    try {
      // First create the post
      const { data, error } = await supabase
        .from('content_posts')
        .insert(post)
        .select()
        .single();
      
      if (error) throw error;
      
      // Then add tags if there are any
      if (tagIds.length > 0) {
        const tagConnections = tagIds.map(tagId => ({
          post_id: data.id,
          tag_id: tagId
        }));
        
        const { error: tagsError } = await supabase
          .from('content_post_tags')
          .insert(tagConnections);
        
        if (tagsError) {
          console.error('Error connecting tags:', tagsError);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Content created successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create content post',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  updatePost: async (id: string, updates: Partial<ContentPost>, tagIds?: string[]): Promise<ContentPost | null> => {
    try {
      // First update the post
      const { data, error } = await supabase
        .from('content_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // If tagIds are provided, update the post's tags
      if (tagIds !== undefined) {
        // Delete existing tag connections
        await supabase
          .from('content_post_tags')
          .delete()
          .eq('post_id', id);
        
        // Add new tag connections
        if (tagIds.length > 0) {
          const tagConnections = tagIds.map(tagId => ({
            post_id: id,
            tag_id: tagId
          }));
          
          const { error: tagsError } = await supabase
            .from('content_post_tags')
            .insert(tagConnections);
          
          if (tagsError) {
            console.error('Error connecting tags:', tagsError);
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Content updated successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update content post',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  deletePost: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Content deleted successfully'
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content post',
        variant: 'destructive'
      });
      return false;
    }
  },
  
  // Tags
  getTags: async (): Promise<ContentTag[]> => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },
  
  createTag: async (name: string): Promise<ContentTag | null> => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      return null;
    }
  },
  
  // Approval flows
  getApprovalFlows: async (): Promise<ContentApprovalFlow[]> => {
    try {
      const { data, error } = await supabase
        .from('content_approval_flows')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching approval flows:', error);
      return [];
    }
  },
  
  // Approvals
  createApproval: async (postId: string, approverId: string): Promise<ContentApproval | null> => {
    try {
      const approval = {
        post_id: postId,
        approver_id: approverId,
        status: 'pending' as const
      };
      
      const { data, error } = await supabase
        .from('content_approvals')
        .insert(approval)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating approval:', error);
      return null;
    }
  },
  
  updateApproval: async (id: string, status: 'approved' | 'rejected', notes?: string): Promise<ContentApproval | null> => {
    try {
      const updates = {
        status,
        notes
      };
      
      const { data, error } = await supabase
        .from('content_approvals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating approval:', error);
      return null;
    }
  },
  
  getPostApprovals: async (postId: string): Promise<ContentApproval[]> => {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*, profiles(*)')
        .eq('post_id', postId);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching post approvals:', error);
      return [];
    }
  },
  
  getPendingApprovals: async (): Promise<ContentApproval[]> => {
    try {
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*, profiles(*), content_posts(*)')
        .eq('status', 'pending');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }
};

// Add ContentAPI to the services/api.ts exports
export const ContentService = ContentAPI;
