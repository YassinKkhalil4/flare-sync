
import { supabase } from '@/integrations/supabase/client';

export const storageService = {
  // Initialize storage buckets
  initializeStorage: async () => {
    try {
      console.log('Initializing storage buckets...');
      
      // Check if buckets exist, create them if they don't
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw listError;
      }

      const existingBuckets = buckets.map(bucket => bucket.name);
      const requiredBuckets = ['content-media', 'avatars'];
      
      for (const bucketName of requiredBuckets) {
        if (!existingBuckets.includes(bucketName)) {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: bucketName === 'content-media' 
              ? ['image/*', 'video/*'] 
              : ['image/*'],
            fileSizeLimit: 100 * 1024 * 1024 // 100MB
          });

          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            throw createError;
          }
          
          console.log(`Created bucket: ${bucketName}`);
        }
      }

      return {
        success: true,
        buckets: requiredBuckets,
        message: 'Storage initialized successfully'
      };
    } catch (error) {
      console.error('Storage initialization error:', error);
      return {
        success: false,
        error: error,
        message: error instanceof Error ? error.message : 'Unknown storage error'
      };
    }
  },

  // Upload content media (images/videos)
  uploadContentMedia: async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('content-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('content-media')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Replace existing avatar
        });

      if (error) {
        console.error('Avatar upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  // Delete file from storage
  deleteFile: async (bucket: string, filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  // Get file URL
  getFileUrl: (bucket: string, filePath: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
