
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async uploadFile(file: File, userId: string, folder: string = 'content'): Promise<{ url?: string; error?: string }> {
    try {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return { error: 'File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, MOV, AVI).' };
      }

      // Validate file size (50MB for content, 5MB for avatars)
      const maxSize = folder === 'avatars' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeMB = folder === 'avatars' ? '5MB' : '50MB';
        return { error: `File size too large. Maximum size is ${maxSizeMB}.` };
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt) {
        return { error: 'File must have an extension.' };
      }

      // Determine bucket based on folder
      const bucket = folder === 'avatars' ? 'avatars' : 'content-uploads';
      
      // Create unique filename with user folder structure
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `${userId}/${folder}/${timestamp}_${randomId}.${fileExt}`;
      
      console.log('Uploading file:', { fileName, bucket, fileSize: file.size, fileType: file.type });

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { error: `Upload failed: ${error.message}` };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('Upload successful:', { path: data.path, publicUrl });
      return { url: publicUrl };
    } catch (error) {
      console.error('Storage service error:', error);
      return { error: error instanceof Error ? error.message : 'Upload failed due to an unexpected error' };
    }
  }

  static async deleteFile(filePath: string, bucket: string = 'content-uploads'): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract the path from the full URL if needed
      const path = filePath.includes('/storage/v1/object/public/') 
        ? filePath.split('/storage/v1/object/public/')[1].split('/').slice(1).join('/')
        : filePath;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Storage delete error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  static async uploadAvatar(file: File, userId: string): Promise<{ url?: string; error?: string }> {
    return this.uploadFile(file, userId, 'avatars');
  }

  static async uploadContentMedia(file: File, userId: string): Promise<{ url?: string; error?: string }> {
    return this.uploadFile(file, userId, 'posts');
  }
}

export const storageService = new StorageService();
