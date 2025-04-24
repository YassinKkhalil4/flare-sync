import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContentList } from '@/components/content/ContentList';
import { ScheduledPosts } from '@/components/content/ScheduledPosts';

export const ContentListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <Button onClick={() => navigate('/content/create')}>Create New Post</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <ContentList />
        </div>
        <div>
          <ScheduledPosts />
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;
