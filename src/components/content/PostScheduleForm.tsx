
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface PostScheduleFormProps {
  selectedDate?: Date;
  onSuccess?: () => void;
}

const PostScheduleForm: React.FC<PostScheduleFormProps> = ({ selectedDate, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    platform: '',
    scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '12:00',
  });

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.content || !formData.platform) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content: formData.content,
          platform: formData.platform,
          scheduled_for: scheduledDateTime,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: 'Post Scheduled',
        description: `Your ${formData.platform} post has been scheduled for ${format(new Date(scheduledDateTime), 'MMMM d, yyyy at h:mm a')}`,
      });

      // Reset form
      setFormData({
        content: '',
        platform: '',
        scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        scheduledTime: '12:00',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your post content..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="platform">Platform *</Label>
        <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem key={platform.value} value={platform.value}>
                {platform.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduledDate">Date *</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="scheduledTime">Time *</Label>
          <Input
            id="scheduledTime"
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scheduling...
          </>
        ) : (
          'Schedule Post'
        )}
      </Button>
    </form>
  );
};

export default PostScheduleForm;
