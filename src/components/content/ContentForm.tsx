
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useRealContent } from '@/hooks/useRealContent';
import { useToast } from '@/hooks/use-toast';
import { ContentPost, SocialPlatform } from '@/types/content';
import { MediaUpload } from './MediaUpload';

interface ContentFormProps {
  initialData?: Partial<ContentPost>;
  onSuccess?: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ initialData, onSuccess }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [platform, setPlatform] = useState<SocialPlatform>(initialData?.platform as SocialPlatform || 'instagram');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialData?.scheduled_for ? new Date(initialData.scheduled_for) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.media_urls || []);
  const [postType, setPostType] = useState<'immediate' | 'scheduled' | 'draft'>('immediate');

  const { createPost, schedulePost, isCreatingPost, isSchedulingPost } = useRealContent();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a title for your post',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (postType === 'scheduled' && scheduledDate && scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':');
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

        await schedulePost({
          title,
          content: body,
          platform,
          scheduled_for: scheduledDateTime.toISOString(),
          status: 'pending',
          media_urls: mediaUrls,
          metadata: {
            created_via: 'content_form',
          },
        });
      } else {
        const status = postType === 'draft' ? 'draft' : 'published';
        
        await createPost({
          title,
          body,
          platform,
          status,
          media_urls: mediaUrls,
          published_at: postType === 'immediate' ? new Date().toISOString() : null,
        });
      }

      // Reset form
      setTitle('');
      setBody('');
      setPlatform('instagram');
      setScheduledDate(undefined);
      setScheduledTime('');
      setMediaUrls([]);
      setPostType('immediate');

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Content</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(value: SocialPlatform) => setPlatform(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={(value) => setPostType(value as 'immediate' | 'scheduled' | 'draft')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Publish Immediately</SelectItem>
                  <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {postType === 'scheduled' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Schedule Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required={postType === 'scheduled'}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Media Files</Label>
            <MediaUpload 
              onMediaUpload={setMediaUrls}
              existingUrls={mediaUrls}
              maxFiles={5}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreatingPost || isSchedulingPost}
          >
            {isCreatingPost || isSchedulingPost ? 'Processing...' : 
             postType === 'scheduled' ? 'Schedule Post' :
             postType === 'draft' ? 'Save Draft' : 'Publish Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentForm;
