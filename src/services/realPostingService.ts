
import { supabase } from '@/integrations/supabase/client';

export interface PostingRequest {
  platform: string;
  content: string;
  media_urls?: string[];
  post_id?: string;
  scheduled_for?: string;
}

export interface PostingResponse {
  success: boolean;
  platform_post_id?: string;
  error?: string;
  message?: string;
}

export class RealPostingService {
  static async postToInstagram(request: PostingRequest): Promise<PostingResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('post-to-instagram', {
        body: {
          caption: request.content,
          media_urls: request.media_urls,
          post_id: request.post_id
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Instagram posting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to Instagram'
      };
    }
  }

  static async postToTwitter(request: PostingRequest): Promise<PostingResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('post-to-twitter', {
        body: {
          text: request.content,
          media_urls: request.media_urls,
          post_id: request.post_id
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Twitter posting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to Twitter'
      };
    }
  }

  static async postToTikTok(request: PostingRequest): Promise<PostingResponse> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('post-to-tiktok', {
        body: {
          caption: request.content,
          media_urls: request.media_urls,
          post_id: request.post_id
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('TikTok posting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to TikTok'
      };
    }
  }

  static async schedulePost(request: PostingRequest): Promise<PostingResponse> {
    try {
      // Store scheduled post
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: session.session.user.id,
          platform: request.platform,
          content: request.content,
          media_urls: request.media_urls,
          scheduled_for: request.scheduled_for,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Post scheduled successfully',
        platform_post_id: data.id
      };
    } catch (error) {
      console.error('Scheduling error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule post'
      };
    }
  }

  static async publishPost(platform: string, content: string, media_urls?: string[], post_id?: string): Promise<PostingResponse> {
    const request: PostingRequest = {
      platform,
      content,
      media_urls,
      post_id
    };

    switch (platform) {
      case 'instagram':
        return this.postToInstagram(request);
      case 'twitter':
        return this.postToTwitter(request);
      case 'tiktok':
        return this.postToTikTok(request);
      default:
        return {
          success: false,
          error: `Platform ${platform} not supported`
        };
    }
  }
}
