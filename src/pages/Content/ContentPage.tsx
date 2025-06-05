
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RealPostList from '@/components/content/RealPostList';
import { useRealContent } from '@/hooks/useRealContent';
import { ContentPost } from '@/types/content';
import { useNavigate } from 'react-router-dom';

const ContentPage: React.FC = () => {
  const navigate = useNavigate();
  const { posts, scheduledPosts, isLoadingPosts, isLoadingScheduled } = useRealContent();

  const handleCreatePost = () => {
    navigate('/content/create');
  };

  const handleEditPost = (post: ContentPost) => {
    navigate(`/content/edit/${post.id}`);
  };

  const handleViewAnalytics = (post: ContentPost) => {
    navigate(`/analytics/post/${post.id}`);
  };

  if (isLoadingPosts || isLoadingScheduled) {
    return <div className="p-6">Loading your content...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage your posts and scheduled content across all platforms
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Content ({posts.length + scheduledPosts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({posts.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledPosts.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RealPostList 
            onEdit={handleEditPost}
            onViewAnalytics={handleViewAnalytics}
          />
        </TabsContent>

        <TabsContent value="published">
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.platform}</p>
                <p className="text-xs text-muted-foreground">
                  Published: {post.published_at ? new Date(post.published_at).toLocaleString() : 'Not published'}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="grid gap-4">
            {scheduledPosts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{post.metadata?.title || 'Scheduled Post'}</h3>
                <p className="text-sm text-muted-foreground">{post.platform}</p>
                <p className="text-xs text-muted-foreground">
                  Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <div className="grid gap-4">
            {posts.filter(post => post.status === 'draft').map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.platform}</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPage;
