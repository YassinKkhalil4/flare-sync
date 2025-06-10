
import { supabase } from '@/integrations/supabase/client';

export class TestDatabase {
  static async createTestUser(email: string = 'test@example.com') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'test-password-123'
    });
    
    if (error) throw error;
    return data.user;
  }

  static async cleanupTestUser(userId: string) {
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch (error) {
      // Silent cleanup failure
    }
  }

  static async createTestPost(userId: string, data: Partial<any> = {}) {
    const postData = {
      user_id: userId,
      title: 'Test Post',
      body: 'Test content',
      platform: 'instagram',
      status: 'draft',
      ...data
    };

    const { data: post, error } = await supabase
      .from('content_posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return post;
  }

  static async cleanupTestPost(postId: string) {
    await supabase.from('content_posts').delete().eq('id', postId);
  }

  static async resetTestData() {
    // Clean up test data - be careful in production!
    if (process.env.NODE_ENV === 'test') {
      await supabase.from('content_posts').delete().like('title', '%Test%');
      await supabase.from('notifications').delete().like('title', '%Test%');
    }
  }
}
