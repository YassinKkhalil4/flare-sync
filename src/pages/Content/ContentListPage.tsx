
import React from 'react';
import { ContentList } from '@/components/content/ContentList';
import ApprovalQueue from '@/components/content/ApprovalQueue';

export const ContentListPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Content Management</h1>
      <ContentList />
    </div>
  );
};

export default ContentListPage;
