
import React from 'react';
import ApprovalQueue from '@/components/content/ApprovalQueue';

export const ContentApprovalPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Content Approvals</h1>
      <ApprovalQueue />
    </div>
  );
};

export default ContentApprovalPage;
