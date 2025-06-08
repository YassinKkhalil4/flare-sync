
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, User } from 'lucide-react';
import { StorageService } from '@/services/storageService';
import { supabase } from '@/integrations/supabase/client';

interface AvatarUploadProps {
  userInitials: string;
  avatarUrl?: string;
}

const AvatarUpload = ({ userInitials, avatarUrl }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload to storage
      const uploadResult = await StorageService.uploadAvatar(file, user.id);
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      if (uploadResult.url) {
        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: uploadResult.url })
          .eq('id', user.id);

        if (updateError) {
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        setCurrentAvatarUrl(uploadResult.url);
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Could not upload your profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group mb-4">
        <Avatar className="h-32 w-32">
          {currentAvatarUrl ? (
            <AvatarImage 
              src={currentAvatarUrl} 
              alt="Profile" 
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <AvatarFallback className="text-2xl">
              <User className="h-10 w-10" />
            </AvatarFallback>
          )}
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </label>
        <input 
          id="avatar-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleAvatarUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
