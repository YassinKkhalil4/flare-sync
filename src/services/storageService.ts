
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BUCKETS = {
  AVATARS: 'avatars',
  CONTENT: 'content',
  MEDIA: 'media',
};

class StorageService {
  /**
   * Initialize storage buckets
   */
  async initializeStorage() {
    try {
      console.log('Initializing storage buckets...');
      const { data, error } = await supabase.functions.invoke('create-storage-bucket', {
        body: { bucketName: BUCKETS.AVATARS }
      });
      
      if (error) {
        console.error('Error initializing avatars bucket:', error);
        throw error;
      }
      
      console.log('Avatar bucket status:', data);
      
      // Initialize content bucket
      const { data: contentData, error: contentError } = await supabase.functions.invoke('create-storage-bucket', {
        body: { bucketName: BUCKETS.CONTENT }
      });
      
      if (contentError) {
        console.error('Error initializing content bucket:', contentError);
        throw contentError;
      }
      
      console.log('Content bucket status:', contentData);
      
      // Initialize media bucket
      const { data: mediaData, error: mediaError } = await supabase.functions.invoke('create-storage-bucket', {
        body: { bucketName: BUCKETS.MEDIA }
      });
      
      if (mediaError) {
        console.error('Error initializing media bucket:', mediaError);
        throw mediaError;
      }
      
      console.log('Media bucket status:', mediaData);
      
      return {
        success: true,
        message: 'Storage buckets initialized successfully',
        buckets: [BUCKETS.AVATARS, BUCKETS.CONTENT, BUCKETS.MEDIA]
      };
    } catch (error) {
      console.error('Storage initialization error:', error);
      return {
        success: false,
        message: error.message || 'Failed to initialize storage buckets',
        error
      };
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(BUCKETS.AVATARS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Avatar upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKETS.AVATARS)
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  /**
   * Upload content media (for posts)
   */
  async uploadContentMedia(userId: string, file: File): Promise<string | null> {
    try {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(BUCKETS.CONTENT)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Content media upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKETS.CONTENT)
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading content media:', error);
      return null;
    }
  }

  /**
   * Upload general media files
   */
  async uploadMedia(userId: string, file: File, folder: string = 'general'): Promise<string | null> {
    try {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userId}/${folder}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(BUCKETS.MEDIA)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Media upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKETS.MEDIA)
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) {
        console.error('File deletion error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
