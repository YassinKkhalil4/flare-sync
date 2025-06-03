
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useScheduler } from '@/hooks/useScheduler';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

interface PublishButtonProps {
  postId: string;
  platform: string;
  status: string;
  onPublishSuccess?: () => void;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  postId,
  platform,
  status,
  onPublishSuccess
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { publishScheduledPost } = useScheduler();
  const { toast } = useToast();

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishScheduledPost(postId, platform);
      onPublishSuccess?.();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        variant: 'destructive',
        title: 'Publishing Failed',
        description: 'Failed to publish post. Please try again.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (status === 'published') {
    return (
      <Button variant="outline" disabled>
        Published
      </Button>
    );
  }

  if (status === 'failed') {
    return (
      <Button variant="destructive" onClick={handlePublish} disabled={isPublishing}>
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          'Retry'
        )}
      </Button>
    );
  }

  return (
    <Button onClick={handlePublish} disabled={isPublishing}>
      {isPublishing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Publishing...
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          Publish Now
        </>
      )}
    </Button>
  );
};
