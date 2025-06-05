
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface PublishButtonProps {
  post: any;
  onPublishSuccess?: () => void;
}

export const PublishButton: React.FC<PublishButtonProps> = ({ 
  post, 
  onPublishSuccess 
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePublish = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to publish posts.',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);
    try {
      await publishPost(post.id);
      
      toast({
        title: 'Post Published',
        description: 'Your post has been published successfully!',
      });
      
      if (onPublishSuccess) {
        onPublishSuccess();
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast({
        title: 'Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to publish post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const publishPost = async (postId: string) => {
    // Simulate publishing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Post with ID ${postId} published successfully!`);
        resolve(null);
      }, 1500);
    });
  };

  return (
    <Button
      variant="default"
      disabled={isPublishing}
      onClick={handlePublish}
    >
      {isPublishing ? 'Publishing...' : 'Publish Now'}
    </Button>
  );
};
