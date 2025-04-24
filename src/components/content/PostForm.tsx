import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentPost, ContentStatus, SocialPlatform } from '@/types/content';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ContentService } from '@/services/api';

interface PostFormProps {
  onSubmit: (data: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>, tagIds?: string[]) => Promise<void>;
  onCancel: () => void;
  initialValues?: ContentPost;
  tags: { id: string; name: string }[];
  isLoading: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onCancel, initialValues, tags, isLoading }) => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm<Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: initialValues || {
      user_id: '',
      title: '',
      body: '',
      media_urls: [],
      status: 'draft',
      scheduled_for: '',
      platform: 'instagram',
      platform_post_id: '',
      reviewer_id: '',
      reviewer_notes: '',
    },
    mode: 'onSubmit'
  });
  
  const { toast } = useToast();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (initialValues?.tags) {
      setSelectedTagIds(initialValues.tags.map(tag => tag.id));
    }
  }, [initialValues?.tags]);
  
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'scheduled', label: 'Scheduled' },
  ] as const;

  const platformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitch', label: 'Twitch' }
  ] as const;

  const tinyMCEApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  const watchedStatus = watch("status");
  
  const handleEditorChange = (content: string | undefined) => {
    setValue('body', content || '', { shouldValidate: true });
  };
  
  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const onSubmitHandler = async (data: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await onSubmit(data, selectedTagIds);
      toast({
        title: 'Success',
        description: 'Post saved successfully!',
      });
    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleScheduledSubmit = async (data: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ContentService.schedulePost(data);
      toast({
        title: 'Success',
        description: 'Post scheduled successfully!',
      });
      navigate('/content');
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to schedule post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialValues ? 'Edit Post' : 'Create New Post'}</CardTitle>
        <CardDescription>Create and manage your content posts here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Input id="title" placeholder="Post title" {...field} />
              )}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="body">Body</Label>
            <Controller
              name="body"
              control={control}
              rules={{ required: 'Body is required' }}
              render={({ field }) => (
                <Editor
                  apiKey={tinyMCEApiKey}
                  value={field.value || ''}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      'advlist autolink lists link image charmap print preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar:
                      'undo redo | formatselect | ' +
                      'bold italic backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
              )}
            />
            {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Controller
              name="platform"
              control={control}
              rules={{ required: 'Platform is required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>{platform.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform && <p className="text-red-500 text-sm">{errors.platform.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>

          {watchedStatus === 'scheduled' && (
            <div>
              <Label htmlFor="scheduled_for">Scheduled For</Label>
              <Controller
                name="scheduled_for"
                control={control}
                render={({ field }) => (
                  <Input type="datetime-local" id="scheduled_for" {...field} />
                )}
              />
            </div>
          )}
          
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Button
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                  onClick={() => handleTagSelect(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" onClick={handleSubmit(onSubmitHandler)} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Post'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostForm;
