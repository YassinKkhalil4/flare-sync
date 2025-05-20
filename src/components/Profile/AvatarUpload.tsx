
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, User } from 'lucide-react';

interface AvatarUploadProps {
  userInitials: string;
  avatarUrl?: string;
}

const AvatarUpload = ({ userInitials, avatarUrl }: AvatarUploadProps) => {
  const { uploadAvatar } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const newAvatarUrl = await uploadAvatar(file);
      if (newAvatarUrl) {
        setCurrentAvatarUrl(newAvatarUrl);
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated.',
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload your profile picture. Please try again.',
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
            <AvatarImage src={currentAvatarUrl} alt="Profile" />
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
