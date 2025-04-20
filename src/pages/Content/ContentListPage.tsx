
import React from 'react';
import { ContentList } from '@/components/content/ContentList';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';

export const ContentListPage: React.FC = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['content-posts'],
    queryFn: ContentService.getPosts
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Content Management</h1>
      <ContentList posts={posts || []} isLoading={isLoading} />
    </div>
  );
};

export default ContentListPage;
