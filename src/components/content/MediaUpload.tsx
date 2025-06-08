
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Image, Video, FileImage, Loader2 } from 'lucide-react';
import { StorageService } from '@/services/storageService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface MediaUploadProps {
  onMediaUpload: (urls: string[]) => void;
  existingUrls?: string[];
  maxFiles?: number;
}

interface UploadProgress {
  [key: string]: number;
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

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
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const fileKey = `${file.name}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
        
        // Simulate progress for UI feedback
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: Math.min((prev[fileKey] || 0) + 10, 90)
          }));
        }, 200);

        try {
          const result = await StorageService.uploadContentMedia(file, user.id);
          clearInterval(progressInterval);
          
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          
          if (result.error) {
            toast({
              title: 'Upload failed',
              description: result.error,
              variant: 'destructive',
            });
            return null;
          }
          
          return result.url;
        } catch (error) {
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
          throw error;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      const newUrls = results.filter((url): url is string => url !== null);
      
      if (newUrls.length > 0) {
        const updatedUrls = [...mediaUrls, ...newUrls];
        setMediaUrls(updatedUrls);
        onMediaUpload(updatedUrls);
        
        toast({
          title: 'Upload successful',
          description: `${newUrls.length} file(s) uploaded successfully`,
        });
      }
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  }, [user, mediaUrls, maxFiles, onMediaUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.quicktime', '.mov', '.avi']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: uploading
  });

  const removeMedia = async (index: number) => {
    const urlToRemove = mediaUrls[index];
    
    // Attempt to delete from storage
    try {
      await StorageService.deleteFile(urlToRemove);
    } catch (error) {
      console.warn('Failed to delete file from storage:', error);
    }
    
    const updatedUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(updatedUrls);
    onMediaUpload(updatedUrls);
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'quicktime', 'mov', 'avi'].includes(extension || '') ? 'video' : 'image';
  };

  const getFileIcon = (url: string) => {
    const type = getFileType(url);
    return type === 'video' ? Video : FileImage;
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

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading files...</h4>
          {Object.entries(uploadProgress).map(([fileKey, progress]) => (
            <div key={fileKey} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{fileKey.split('_')[0]}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Media Preview */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaUrls.map((url, index) => {
            const FileIcon = getFileIcon(url);
            return (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  {getFileType(url) === 'video' ? (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                      <Video className="h-8 w-8 text-gray-400" />
                      <video 
                        src={url} 
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        muted
                      />
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = 'aspect-square bg-gray-100 flex items-center justify-center';
                          parent.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14.25 9.75L10.5 13.5L8.25 11.25L4.5 15h15v-5.25z"/><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z"/></svg>';
                        }
                      }}
                    />
                  )}
                </Card>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
