
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to handle file storage operations with Supabase Storage
 */
export const storageService = {
  /**
   * Upload a file to the user's avatars bucket
   */
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      // Create a unique file path to avoid collisions
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Ensure the bucket exists
      await ensureBucketExists('avatars');
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
      
      if (error) {
        console.error('Error uploading avatar:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return null;
    }
  },
  
  /**
   * Upload media files for content posts
   */
  uploadContentMedia: async (userId: string, file: File): Promise<string | null> => {
    try {
      // Create a unique file path to avoid collisions
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${uuidv4()}.${fileExt}`;
      
      // Ensure the bucket exists
      await ensureBucketExists('content');
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('content')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });
      
      if (error) {
        console.error('Error uploading content media:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('content')
        .getPublicUrl(data.path);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadContentMedia:', error);
      return null;
    }
  },
  
  /**
   * Delete a file from storage
   */
  deleteFile: async (bucket: string, filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) {
        console.error(`Error deleting file from ${bucket}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteFile from ${bucket}:`, error);
      return false;
    }
  }
};

/**
 * Helper function to ensure a bucket exists
 */
async function ensureBucketExists(bucketName: string): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error(`Error creating ${bucketName} bucket:`, error);
      }
    }
  } catch (error) {
    console.error(`Error checking/creating ${bucketName} bucket:`, error);
  }
}
