import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentPost, SocialPlatform, ContentStatus } from '@/types/content';
import { PostFormData, toContentPost } from '@/types/postForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ContentAPI } from '@/services/contentService';
import { MediaUpload } from './MediaUpload';
import { TagSelector } from './TagSelector';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
  } = useForm<PostFormData>({
    defaultValues: initialValues ? {
      user_id: initialValues.user_id,
      title: initialValues.title,
      body: initialValues.body || '',
      media_urls: initialValues.media_urls || [],
      status: initialValues.status as ContentStatus,
      scheduled_for: initialValues.scheduled_for || '',
      platform: initialValues.platform as SocialPlatform,
    } : {
      user_id: '',
      title: '',
      body: '',
      media_urls: [],
      status: 'draft' as ContentStatus,
      scheduled_for: '',
      platform: 'instagram' as SocialPlatform,
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

  const tinyMCEApiKey = import.meta.env.VITE_TINYMCE_API_KEY || '';

  const watchedStatus = watch("status");
  
  const handleEditorChange = (content: string | undefined) => {
    setValue('body', content || '', { shouldValidate: true });
  };

  const handleMediaUpload = (urls: string[]) => {
    setValue('media_urls', urls);
  };

  const onSubmitHandler = async (data: PostFormData) => {
    try {
      const contentPostData = toContentPost(data);
      await onSubmit(contentPostData, selectedTagIds);
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

  const handleScheduledSubmit = async (data: PostFormData) => {
    try {
      await ContentAPI.schedulePost(data);
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
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>{initialValues ? 'Edit Post' : 'Create New Post'}</CardTitle>
          <CardDescription>Create and manage your content posts here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
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
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="body">Content</Label>
              <Controller
                name="body"
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <Editor
                    apiKey={tinyMCEApiKey}
                    value={field.value || ''}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 400,
                      menubar: false,
                      readonly: false,
                      plugins: [
                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                        'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
                      ],
                      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                      tinycomments_mode: 'embedded',
                      tinycomments_author: 'Author name',
                      mergetags_list: [
                        { value: 'First.Name', title: 'First Name' },
                        { value: 'Email', title: 'Email' },
                      ],
                      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                )}
              />
              {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>}
            </div>

            <div>
              <Label>Media</Label>
              <MediaUpload
                onMediaUpload={handleMediaUpload}
                existingUrls={watch('media_urls') || []}
                maxFiles={5}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform.message}</p>}
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
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
              </div>
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
            
            <TagSelector
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
            />
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
    </ErrorBoundary>
  );
};

export default PostForm;