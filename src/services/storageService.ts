
import { supabase } from '@/integrations/supabase/client';

export const storageService = {
  // Initialize storage buckets
  initializeStorage: async () => {
    try {
      console.log('Initializing storage buckets...');
      
      // Check if buckets exist first
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        // If we can't list buckets, still return success to not block the app
        return {
          success: true,
          buckets: [],
          message: 'Storage listing unavailable but app can continue'
        };
      }

      const existingBuckets = buckets?.map(bucket => bucket.name) || [];
      const requiredBuckets = ['content-media', 'avatars'];
      
      // Try to create missing buckets with more conservative settings
      for (const bucketName of requiredBuckets) {
        if (!existingBuckets.includes(bucketName)) {
          console.log(`Creating bucket: ${bucketName}`);
          
          // Use smaller file size limits and simpler configuration
          const bucketConfig = {
            public: true,
            allowedMimeTypes: bucketName === 'content-media' 
              ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'] 
              : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: bucketName === 'content-media' 
              ? 50 * 1024 * 1024  // 50MB for content
              : 5 * 1024 * 1024   // 5MB for avatars
          };

          const { error: createError } = await supabase.storage.createBucket(bucketName, bucketConfig);

          if (createError) {
            console.warn(`Warning creating bucket ${bucketName}:`, createError);
            // Don't throw error, just warn and continue
            // The app can still function without all buckets
          } else {
            console.log(`Successfully created bucket: ${bucketName}`);
          }
        } else {
          console.log(`Bucket ${bucketName} already exists`);
        }
      }

      return {
        success: true,
        buckets: requiredBuckets,
        message: 'Storage initialized successfully'
      };
    } catch (error) {
      console.error('Storage initialization error:', error);
      
      // Don't fail the entire app initialization for storage issues
      // Return success but log the issue
      return {
        success: true,
        error: error,
        message: 'Storage initialization had issues but app can continue'
      };
    }
  },

  // Upload content media (images/videos)
  uploadContentMedia: async (userId: string, file: File): Promise<string | null> => {
    try {
      // Check file size before upload
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        console.error('File too large:', file.size);
        throw new Error('File size exceeds 50MB limit');
      }

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
      // Check file size before upload
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.error('Avatar file too large:', file.size);
        throw new Error('Avatar file size exceeds 5MB limit');
      }

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
