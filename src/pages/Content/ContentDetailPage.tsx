
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import PostDetail from '@/components/content/PostDetail';
import { useNavigate } from 'react-router-dom';

export const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['content-post', id],
    queryFn: () => id ? ContentService.getPostById(id) : null,
    enabled: !!id
  });
  
  if (!id) {
    return <div>Post ID not found</div>;
  }
  
  if (!post && !isLoading) {
    return <div>Post not found</div>;
  }

  const handleClose = () => {
    navigate('/content');
  };

  return (
    <div className="container mx-auto py-8">
      <PostDetail postId={id} onClose={handleClose} />
    </div>
  );
};

export default ContentDetailPage;
