
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
      
      // Check if bucket exists first
      const { data: bucketExists } = await supabase.storage.getBucket('avatars');
      
      // If bucket doesn't exist, we'll try to create it, but won't fail if we can't
      if (!bucketExists) {
        try {
          // Try to create the bucket through the edge function
          await supabase.functions.invoke('create-storage-bucket', {
            body: { bucketName: 'avatars' }
          });
          console.log("Attempted to create avatars bucket via edge function");
        } catch (error) {
          console.warn("Failed to create avatars bucket via edge function:", error);
          // Continue anyway - the upload might still work if bucket was created via other means
        }
      }
      
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
      
      // Check if bucket exists first
      const { data: bucketExists } = await supabase.storage.getBucket('content');
      
      // If bucket doesn't exist, we'll try to create it, but won't fail if we can't
      if (!bucketExists) {
        try {
          // Try to create the bucket through the edge function
          await supabase.functions.invoke('create-storage-bucket', {
            body: { bucketName: 'content' }
          });
          console.log("Attempted to create content bucket via edge function");
        } catch (error) {
          console.warn("Failed to create content bucket via edge function:", error);
          // Continue anyway - the upload might still work if bucket was created via other means
        }
      }
      
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
  },
  
  /**
   * Check if a bucket exists
   */
  checkBucketExists: async (bucketName: string): Promise<boolean> => {
    try {
      const { data } = await supabase.storage.getBucket(bucketName);
      return !!data;
    } catch (error) {
      console.error(`Error checking if bucket ${bucketName} exists:`, error);
      return false;
    }
  }
};
