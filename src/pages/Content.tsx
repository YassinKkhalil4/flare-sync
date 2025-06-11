
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealContent } from '@/hooks/useRealContent';
import RealPostList from '@/components/content/RealPostList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, BarChart3, Clock, FileText, Media, Settings } from 'lucide-react';

const Content: React.FC = () => {
  const navigate = useNavigate();
  const { posts, scheduledPosts, isLoadingPosts, isLoadingScheduled } = useRealContent();

  const handleCreatePost = () => {
    navigate('/content/create');
  };

  const handleEditPost = (postId: string) => {
    navigate(`/content/edit/${postId}`);
  };

  const handleViewAnalytics = (postId: string) => {
    navigate(`/analytics/post/${postId}`);
  };

  if (isLoadingPosts || isLoadingScheduled) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading your content...</div>
      </div>
    );
  }

  const stats = {
    totalPosts: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: scheduledPosts.length,
    drafts: posts.filter(p => p.status === 'draft').length
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Create, schedule, and manage your social media content across all platforms
          </p>
        </div>
        <Button onClick={handleCreatePost} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">All content pieces</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Live on platforms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Queued for publishing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Work in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/content/calendar')}
              className="h-20 flex flex-col gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Content Calendar</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/content/scheduler')}
              className="h-20 flex flex-col gap-2"
            >
              <Clock className="h-6 w-6" />
              <span>Smart Scheduler</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/caption-generator')}
              className="h-20 flex flex-col gap-2"
            >
              <FileText className="h-6 w-6" />
              <span>AI Captions</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/media-manager')}
              className="h-20 flex flex-col gap-2"
            >
              <Media className="h-6 w-6" />
              <span>Media Manager</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/social-connect')}
              className="h-20 flex flex-col gap-2"
            >
              <Settings className="h-6 w-6" />
              <span>Social Accounts</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Content ({stats.totalPosts + stats.scheduled})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({stats.published})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({stats.scheduled})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({stats.drafts})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-6">
              <RealPostList 
                onEdit={handleEditPost}
                onViewAnalytics={handleViewAnalytics}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {posts.filter(post => post.status === 'published').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No published posts yet. Create your first post to get started!</p>
                  </div>
                ) : (
                  posts.filter(post => post.status === 'published').map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        Published: {post.published_at ? new Date(post.published_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No scheduled posts. Use the scheduler to plan your content!</p>
                  </div>
                ) : (
                  scheduledPosts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium">{post.metadata?.title || 'Scheduled Post'}</h3>
                      <p className="text-sm text-muted-foreground">{post.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {posts.filter(post => post.status === 'draft').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No drafts saved. Start creating content and save as draft!</p>
                  </div>
                ) : (
                  posts.filter(post => post.status === 'draft').map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">{post.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Content;
