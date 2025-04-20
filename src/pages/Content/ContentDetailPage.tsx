import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import PostDetail from '@/components/content/PostDetail';

export const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Post ID not found</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <PostDetail postId={id} />
    </div>
  );
};

export default ContentDetailPage;
