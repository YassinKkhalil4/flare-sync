
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, Eye, Calendar as CalendarIcon, Clock, Media, Tags, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentPost, SocialPlatform, ContentStatus } from '@/types/content';
import { MediaManager } from '../media/MediaManager';
import { format } from 'date-fns';

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Fetch post data
  const { data: post, isLoading } = useQuery({
    queryKey: ['content-post', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ContentPost;
    },
    enabled: !!id
  });

  // Update form when post data loads
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body || '');
      setPlatform(post.platform as SocialPlatform);
      setStatus(post.status as ContentStatus);
      setMediaUrls(post.media_urls || []);
      
      if (post.scheduled_for) {
        const scheduledDateTime = new Date(post.scheduled_for);
        setScheduledDate(scheduledDateTime);
        setScheduledTime(format(scheduledDateTime, 'HH:mm'));
      }
    }
  }, [post]);

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: async (postData: Partial<ContentPost>) => {
      if (!id || !user) throw new Error('Missing required data');
      
      const { error } = await supabase
        .from('content_posts')
        .update(postData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-post', id] });
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
      console.error('Error updating post:', error);
    }
  });

  const handleSave = () => {
    let scheduledFor = null;
    if (status === 'scheduled' && scheduledDate && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      scheduledFor = scheduledDateTime.toISOString();
    }

    const updateData: Partial<ContentPost> = {
      title,
      body,
      platform,
      status,
      media_urls: mediaUrls,
      scheduled_for: scheduledFor,
      updated_at: new Date().toISOString(),
    };

    savePostMutation.mutate(updateData);
  };

  const handleMediaSelect = (files: any[]) => {
    const urls = files.map(file => file.url);
    setMediaUrls(prev => [...prev, ...urls]);
    setShowMediaManager(false);
  };

  const removeMediaUrl = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handlePublishNow = () => {
    const updateData: Partial<ContentPost> = {
      title,
      body,
      platform,
      status: 'published',
      media_urls: mediaUrls,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    savePostMutation.mutate(updateData);
  };

  if (isLoading) {
    return <div className="p-6">Loading post...</div>;
  }

  if (!post) {
    return <div className="p-6">Post not found</div>;
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/content')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Post</h1>
            <p className="text-muted-foreground">
              Last updated: {format(new Date(post.updated_at), 'PPp')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status}
          </Badge>
          <Button onClick={handleSave} disabled={savePostMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {savePostMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          {status === 'draft' && (
            <Button onClick={handlePublishNow} disabled={savePostMutation.isPending}>
              Publish Now
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Media className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>
              
              <div>
                <Label htmlFor="body">Content</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={8}
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    <Tags className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Files ({mediaUrls.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowMediaManager(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Media className="h-4 w-4 mr-2" />
                  Add Media Files
                </Button>
                
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMediaUrl(url)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: ContentStatus) => setStatus(value)}>
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
              
              {status === 'scheduled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  
                  <div>
                    <Label htmlFor="time">Schedule Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
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
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Post Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p>{format(new Date(post.created_at), 'PPp')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p>{format(new Date(post.updated_at), 'PPp')}</p>
                  </div>
                  {post.published_at && (
                    <div>
                      <span className="text-muted-foreground">Published:</span>
                      <p>{format(new Date(post.published_at), 'PPp')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Media Manager Dialog */}
      <Dialog open={showMediaManager} onOpenChange={setShowMediaManager}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Media Manager</DialogTitle>
          </DialogHeader>
          <MediaManager
            mode="select"
            maxSelection={5}
            onSelectMedia={handleMediaSelect}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
