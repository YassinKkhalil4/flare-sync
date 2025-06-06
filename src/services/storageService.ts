
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async initializeStorage() {
    try {
      // Check if user-content bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.warn('Could not list buckets:', bucketsError);
        return { success: false, error: bucketsError.message };
      }

      const userContentBucket = buckets?.find(bucket => bucket.name === 'user-content');
      
      if (!userContentBucket) {
        // Create the bucket via edge function
        const { data, error } = await supabase.functions.invoke('create-storage-bucket', {
          body: { bucketName: 'user-content' }
        });
        
        if (error) {
          console.warn('Could not create storage bucket:', error);
          return { success: false, error: error.message };
        }
        
        console.log('Storage bucket created:', data);
      }
      
      return { success: true, message: 'Storage initialized successfully' };
    } catch (error) {
      console.error('Storage initialization error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown storage error' 
      };
    }
  }

  static async uploadFile(file: File, userId: string, folder: string = 'content'): Promise<{ url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('user-content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { error: error.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(data.path);

      return { url: publicUrl };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  static async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from('user-content')
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }
}

export const storageService = new StorageService();
