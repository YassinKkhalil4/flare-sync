
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentForm from '@/components/content/ContentForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ContentCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/content');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/content')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground mt-2">
          Create engaging content for your social media platforms
        </p>
      </div>

      <ContentForm onSuccess={handleSuccess} />
    </div>
  );
};

export default ContentCreatePage;
