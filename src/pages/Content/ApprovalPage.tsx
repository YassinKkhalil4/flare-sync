
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApprovalQueue from '@/components/content/ApprovalQueue';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/content')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        <h1 className="text-3xl font-bold">Content Approval Queue</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve content before it goes live
        </p>
      </div>

      <ApprovalQueue />
    </div>
  );
};

export default ApprovalPage;
