
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { ContentService, SocialService } from '@/services/api';
import { ContentPost, ContentTag, SocialPlatform } from '@/types/content';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PostFormProps {
  initialData?: ContentPost;
  onSubmit: (data: Partial<ContentPost>, tagIds: string[]) => Promise<void>;
  isEditing?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  const { register, handleSubmit, control, setValue, watch } = useForm<Partial<ContentPost>>({
    defaultValues: initialData || {
      status: 'draft',
      platform: 'instagram'
    }
  });
  
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  
  const status = watch('status');
  
  const { data: tags = [] as ContentTag[] } = useQuery({
    queryKey: ['content-tags'],
    queryFn: ContentService.getTags
  });
  
  const { data: socialProfiles = [] } = useQuery({
    queryKey: ['social-profiles'],
    queryFn: SocialService.getProfiles
  });

  // Set initial tags if editing
  useEffect(() => {
    if (isEditing && initialData?.tags) {
      setSelectedTagIds(initialData.tags.map(tag => tag.id));
    }
  }, [isEditing, initialData]);
  
  const handleFormSubmit = async (formData: Partial<ContentPost>) => {
    try {
      // If scheduling a post, ensure a date is set
      if (formData.status === 'scheduled' && !formData.scheduled_for) {
        toast({
          title: 'Error',
          description: 'You must select a date to schedule this post',
          variant: 'destructive'
        });
        return;
      }
      
      await onSubmit(formData, selectedTagIds);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive'
      });
    }
  };
  
  const addTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await ContentService.createTag(newTagName.trim());
      if (newTag) {
        setSelectedTagIds(prev => [...prev, newTag.id]);
        setNewTagName('');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Find connected social accounts for each platform
  const getConnectedPlatforms = () => {
    const platforms: SocialPlatform[] = ['instagram', 'tiktok', 'youtube', 'twitter', 'twitch'];
    return platforms.filter(platform => 
      socialProfiles.some(profile => 
        profile.platform === platform && profile.connected
      )
    );
  };

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          {...register('title', { required: true })} 
          placeholder="Post title" 
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="body">Content</Label>
        <Textarea 
          id="body" 
          {...register('body')} 
          placeholder="Write your post content here..." 
          className="mt-1 h-32"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Controller
            name="platform"
            control={control}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={(value: SocialPlatform) => field.onChange(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {connectedPlatforms.length > 0 ? (
                    connectedPlatforms.map(platform => (
                      <SelectItem key={platform} value={platform} className="capitalize">
                        {platform}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-2 px-2 text-sm text-gray-500">
                      No connected platforms. Connect a social account first.
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Submit for Approval</SelectItem>
                  <SelectItem value="scheduled">Schedule</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      
      {status === 'scheduled' && (
        <div>
          <Label htmlFor="scheduled_for">Schedule Date</Label>
          <Controller
            name="scheduled_for"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString());
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
      )}
      
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag: ContentTag) => (
            <Button
              key={tag.id}
              type="button"
              size="sm"
              variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
              onClick={() => toggleTag(tag.id)}
              className="text-xs"
            >
              {tag.name}
            </Button>
          ))}
        </div>
        <div className="flex mt-2">
          <Input
            placeholder="Add new tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="mr-2"
          />
          <Button 
            type="button" 
            onClick={addTag}
            variant="outline"
          >
            Add
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" className="w-32">
          {isEditing ? 'Update' : 'Create'} Post
        </Button>
      </div>
    </form>
  );
};
