
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Image, Video } from 'lucide-react';
import { StorageService } from '@/services/storageService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  onMediaUpload: (urls: string[]) => void;
  existingUrls?: string[];
  maxFiles?: number;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUpload,
  existingUrls = [],
  maxFiles = 5
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingUrls);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload files',
        variant: 'destructive',
      });
      return;
    }

    if (mediaUrls.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} files`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(file =>
        StorageService.uploadFile(file, user.id, 'posts')
      );
      
      const results = await Promise.all(uploadPromises);
      const newUrls: string[] = [];
      
      results.forEach(result => {
        if (result.url) {
          newUrls.push(result.url);
        } else if (result.error) {
          console.error('Upload error:', result.error);
        }
      });
      
      if (newUrls.length > 0) {
        const updatedUrls = [...mediaUrls, ...newUrls];
        setMediaUrls(updatedUrls);
        onMediaUpload(updatedUrls);
        
        toast({
          title: 'Upload successful',
          description: `${newUrls.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [user, mediaUrls, maxFiles, onMediaUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.quicktime']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  });

  const removeMedia = (index: number) => {
    const updatedUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updatedUrls);
    onMediaUpload(updatedUrls);
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'quicktime', 'mov'].includes(extension || '') ? 'video' : 'image';
  };

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images and videos up to 50MB ({maxFiles - mediaUrls.length} remaining)
            </p>
          </div>
        )}
      </Card>

      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                {getFileType(url) === 'video' ? (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <Video className="h-8 w-8 text-gray-400" />
                    <video src={url} className="hidden" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                )}
              </Card>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
