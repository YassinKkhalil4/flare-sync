
import React from 'react';
import InteractiveCalendar from '@/components/content/InteractiveCalendar';
import { useRealContent } from '@/hooks/useRealContent';
import { useToast } from '@/hooks/use-toast';

const ContentCalendarPage: React.FC = () => {
  const { scheduledPosts, schedulePost, isLoadingScheduled } = useRealContent();
  const { toast } = useToast();

  const handleSchedulePost = async (postData: any) => {
    try {
      await schedulePost(postData);
      toast({
        title: 'Success',
        description: 'Post scheduled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule post',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage your content posts across all platforms
        </p>
      </div>
      
      <InteractiveCalendar 
        scheduledPosts={scheduledPosts || []}
        onSchedulePost={handleSchedulePost}
        isSubmitting={isLoadingScheduled}
      />
    </div>
  );
};

export default ContentCalendarPage;
