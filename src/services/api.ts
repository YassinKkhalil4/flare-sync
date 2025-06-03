import { supabase } from '@/integrations/supabase/client';

export const ContentAPI = {
  async addPost(post: any) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  },
  
  async deletePost(id: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
  
  async getPosts() {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getPostById(id: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  async updatePost(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  },

  async updateApproval(id: string, status: 'approved' | 'rejected', feedback?: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({ 
          status,
          approval_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating approval:', error);
      throw error;
    }
  }
};
