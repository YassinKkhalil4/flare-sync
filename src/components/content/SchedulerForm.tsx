
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Zap } from 'lucide-react';

interface SchedulerFormData {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
  content: string;
  scheduledTime: string;
}

interface SchedulerFormProps {
  onSubmit: (data: SchedulerFormData) => void;
  isLoading: boolean;
}

export const SchedulerForm: React.FC<SchedulerFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, setValue, watch } = useForm<SchedulerFormData>({
    defaultValues: {
      postCount: 7,
      platform: '',
      contentType: '',
      audienceLocation: '',
      content: '',
      scheduledTime: '',
    }
  });

  const platform = watch('platform');
  const contentType = watch('contentType');
  const audienceLocation = watch('audienceLocation');

  const handleFormSubmit = (data: SchedulerFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={(value) => setValue('platform', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentType">Content Type</Label>
        <Select value={contentType} onValueChange={(value) => setValue('contentType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="reel">Reel/Short</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audienceLocation">Audience Location</Label>
        <Select value={audienceLocation} onValueChange={(value) => setValue('audienceLocation', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US/Eastern">US Eastern</SelectItem>
            <SelectItem value="US/Central">US Central</SelectItem>
            <SelectItem value="US/Mountain">US Mountain</SelectItem>
            <SelectItem value="US/Pacific">US Pacific</SelectItem>
            <SelectItem value="Europe/London">UK/London</SelectItem>
            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
            <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postCount">Posts per Week</Label>
        <Input
          type="number"
          {...register('postCount', { valueAsNumber: true })}
          min="1"
          max="21"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Post Content</Label>
        <Textarea
          {...register('content')}
          placeholder="Enter your post content..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledTime">Scheduled Time</Label>
        <Input
          type="datetime-local"
          {...register('scheduledTime')}
        />
      </div>

      <Button 
        type="submit"
        className="w-full"
        disabled={isLoading || !platform || !contentType || !audienceLocation}
      >
        {isLoading ? (
          'Analyzing...'
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Schedule Post
          </>
        )}
      </Button>
    </form>
  );
};
