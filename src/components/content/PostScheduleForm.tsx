import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Upload, X, Video, Image as ImageIcon, Check } from 'lucide-react';
import { storageService } from '@/services/storageService';
import { cn } from '@/lib/utils';

interface PostScheduleFormProps {
  selectedDate?: Date;
  onSuccess?: () => void;
}

const PostScheduleForm: React.FC<PostScheduleFormProps> = ({ selectedDate, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    content: '',
    scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '12:00',
  });

  const platforms = [
    { 
      value: 'instagram', 
      label: 'Instagram', 
      icon: '📷',
      color: 'from-purple-600 to-pink-600',
      description: 'Photos & Stories'
    },
    { 
      value: 'twitter', 
      label: 'Twitter/X', 
      icon: '🐦',
      color: 'from-blue-400 to-blue-600',
      description: 'Tweets & Threads'
    },
    { 
      value: 'tiktok', 
      label: 'TikTok', 
      icon: '🎵',
      color: 'from-black to-red-600',
      description: 'Short Videos'
    },
    { 
      value: 'youtube', 
      label: 'YouTube', 
      icon: '📺',
      color: 'from-red-600 to-red-700',
      description: 'Long-form Videos'
    },
    { 
      value: 'facebook', 
      label: 'Facebook', 
      icon: '👥',
      color: 'from-blue-600 to-blue-700',
      description: 'Posts & Stories'
    },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);
    const newMediaUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type and size
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast({
            title: 'Invalid File',
            description: 'Please upload only images or videos',
            variant: 'destructive',
          });
          continue;
        }

        // 100MB limit
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: 'Please upload files smaller than 100MB',
            variant: 'destructive',
          });
          continue;
        }

        const mediaUrl = await storageService.uploadContentMedia(user.id, file);
        if (mediaUrl) {
          newMediaUrls.push(mediaUrl);
        }
      }

      setUploadedMedia(prev => [...prev, ...newMediaUrls]);
      toast({
        title: 'Media Uploaded',
        description: `${newMediaUrls.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.content || selectedPlatforms.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in content and select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      
      // Create a post for each selected platform
      const promises = selectedPlatforms.map(platform => 
        supabase
          .from('scheduled_posts')
          .insert({
            user_id: user.id,
            content: formData.content,
            platform: platform,
            scheduled_for: scheduledDateTime,
            status: 'scheduled',
            media_urls: uploadedMedia.length > 0 ? uploadedMedia : null,
          })
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to schedule some posts');
      }

      toast({
        title: 'Posts Scheduled',
        description: `Your posts have been scheduled for ${selectedPlatforms.length} platform(s) on ${format(new Date(scheduledDateTime), 'MMMM d, yyyy at h:mm a')}`,
      });

      // Reset form
      setFormData({
        content: '',
        scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        scheduledTime: '12:00',
      });
      setSelectedPlatforms([]);
      setUploadedMedia([]);

      onSuccess?.();
    } catch (error) {
      console.error('Error scheduling posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="content" className="text-base font-medium">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your post content..."
            rows={4}
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-4 block">Choose Platforms *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {platforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.value);
              return (
                <div
                  key={platform.value}
                  onClick={() => handlePlatformToggle(platform.value)}
                  className={cn(
                    "relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                    isSelected 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-10",
                    platform.color
                  )} />
                  
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl",
                          platform.color
                        )}>
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{platform.label}</h3>
                          <p className="text-xs text-muted-foreground">{platform.description}</p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedPlatforms.length > 0 && (
            <div className="mt-3 p-3 bg-primary/5 rounded-lg border">
              <p className="text-sm text-primary font-medium">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="media" className="text-base font-medium">Media (Images/Videos)</Label>
          <div className="mt-2">
            <Input
              id="media"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('media')?.click()}
              disabled={isUploading}
              className="w-full h-20 border-2 border-dashed border-border hover:border-primary/50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Upload Media</span>
                  <span className="text-xs text-muted-foreground">Drag & drop or click to browse</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {uploadedMedia.length > 0 && (
          <div>
            <Label className="text-base font-medium">Media Preview</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
              {uploadedMedia.map((url, index) => (
                <div key={index} className="relative group">
                  {isVideoFile(url) ? (
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                      <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                        <ImageIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduledDate" className="text-base font-medium">Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="scheduledTime" className="text-base font-medium">Time *</Label>
            <Input
              id="scheduledTime"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              required
              className="mt-2"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scheduling...
            </>
          ) : (
            `Schedule Post${selectedPlatforms.length > 1 ? 's' : ''} (${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''})`
          )}
        </Button>
      </form>

      {/* Post Preview */}
      {(formData.content || uploadedMedia.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {uploadedMedia.slice(0, 1).map((url, index) => (
                  <div key={index} className="relative">
                    {isVideoFile(url) ? (
                      <video
                        src={url}
                        className="w-full rounded-lg max-h-64 object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={url}
                        alt="Post preview"
                        className="w-full rounded-lg max-h-64 object-cover"
                      />
                    )}
                  </div>
                ))}
                {uploadedMedia.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    +{uploadedMedia.length - 1} more media file(s)
                  </p>
                )}
              </div>
            )}
            {formData.content && (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{formData.content}</p>
              </div>
            )}
            {selectedPlatforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map(platform => {
                  const platformData = platforms.find(p => p.value === platform);
                  return (
                    <div key={platform} className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r text-white",
                      platformData?.color
                    )}>
                      <span>{platformData?.icon}</span>
                      <span>{platformData?.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PostScheduleForm;
