
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { MediaManager } from '@/components/media/MediaManager';
import { 
  Save, 
  Send, 
  Clock, 
  Image, 
  Video, 
  Hash, 
  Calendar as CalendarIcon, 
  ArrowLeft,
  FileText,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { realContentService } from '@/services/realContentService';
import { useAuth } from '@/context/AuthContext';

type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface PostFormData {
  title: string;
  content: string;
  platform: string;
  status: ContentStatus;
  scheduled_for?: string;
  tags: string[];
  media_urls: string[];
  metadata: {
    caption?: string;
    hashtags?: string[];
    location?: string;
    mentions?: string[];
  };
}

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    platform: 'instagram',
    status: 'draft' as ContentStatus,
    tags: [],
    media_urls: [],
    metadata: {}
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [newTag, setNewTag] = useState('');

  // Fetch existing post if editing
  const { data: existingPost, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => id ? realContentService.getPost(id) : null,
    enabled: !!id && id !== 'new',
  });

  // Load existing post data
  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title || '',
        content: existingPost.content || '',
        platform: existingPost.platform || 'instagram',
        status: (existingPost.status as ContentStatus) || 'draft',
        scheduled_for: existingPost.scheduled_for,
        tags: existingPost.tags || [],
        media_urls: existingPost.media_urls || [],
        metadata: existingPost.metadata || {}
      });
      
      if (existingPost.scheduled_for) {
        const scheduledDate = new Date(existingPost.scheduled_for);
        setSelectedDate(scheduledDate);
        setSelectedTime(format(scheduledDate, 'HH:mm'));
      }
    }
  }, [existingPost]);

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const postData = {
        ...data,
        user_id: user.id,
        scheduled_for: selectedDate && formData.status === 'scheduled' 
          ? new Date(`${format(selectedDate, 'yyyy-MM-dd')} ${selectedTime}`).toISOString()
          : undefined
      };

      if (id && id !== 'new') {
        return realContentService.updatePost(id, postData);
      } else {
        return realContentService.createPost(postData);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: id && id !== 'new' ? 'Post updated successfully' : 'Post created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/content');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save post',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = (status: ContentStatus) => {
    handleInputChange('status', status);
    savePostMutation.mutate({ ...formData, status });
  };

  const handleMediaSelect = (selectedMedia: any[]) => {
    const mediaUrls = selectedMedia.map(media => media.url);
    handleInputChange('media_urls', mediaUrls);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/content')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <h1 className="text-3xl font-bold">
            {id && id !== 'new' ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={savePostMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(selectedDate ? 'scheduled' : 'published')}
            disabled={savePostMutation.isPending || !formData.title.trim() || !formData.content.trim()}
          >
            {selectedDate ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Post
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your post content..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Tabs defaultValue="media" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Tags
              </TabsTrigger>
            </TabsList>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaManager
                    mode="select"
                    onSelectMedia={handleMediaSelect}
                    maxSelection={10}
                    allowedTypes={['image/*', 'video/*']}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!!selectedDate}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setSelectedDate(undefined);
                        } else {
                          setSelectedDate(new Date());
                        }
                      }}
                    />
                    <Label>Schedule for later</Label>
                  </div>
                  
                  {selectedDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags">
              <Card>
                <CardHeader>
                  <CardTitle>Tags & Hashtags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Post Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handleInputChange('platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ContentStatus) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Media Preview */}
          {formData.media_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {formData.media_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {formData.media_urls.length > 4 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        +{formData.media_urls.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
