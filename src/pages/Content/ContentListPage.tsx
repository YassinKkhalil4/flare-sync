
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ContentList } from '@/components/content/ContentList';
import { ScheduledPosts } from '@/components/content/ScheduledPosts';
import { ContentAPI } from '@/services/contentService';
import { Skeleton } from '@/components/ui/skeleton';

export const ContentListPage = () => {
  const navigate = useNavigate();
  
  // Fetch content posts using react-query
  const { data: posts, isLoading } = useQuery({
    queryKey: ['contentPosts'],
    queryFn: () => ContentAPI.getPosts()
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <Button onClick={() => navigate('/content/create')}>Create New Post</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Pass the required posts and isLoading props to ContentList */}
          <ContentList posts={posts || []} isLoading={isLoading} />
        </div>
        <div>
          <ScheduledPosts />
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;
