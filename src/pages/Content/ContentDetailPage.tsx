
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { PostDetail } from '@/components/content/PostDetail';

export const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => id ? ContentService.getPostById(id) : null,
    enabled: !!id
  });
  
  if (isLoading || !post) {
    return <div>Loading post...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <PostDetail post={post} />
    </div>
  );
};

export default ContentDetailPage;
