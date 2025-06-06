
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PostScheduleForm } from '@/components/content/PostScheduleForm';
import { format, isSameDay } from 'date-fns';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  scheduled_for: string;
  status: string;
}

interface InteractiveCalendarProps {
  scheduledPosts: ScheduledPost[];
  onSchedulePost: (postData: any) => void;
  isSubmitting?: boolean;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  scheduledPosts,
  onSchedulePost,
  isSubmitting = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(new Date(post.scheduled_for), date)
    );
  };

  const handleSchedulePost = (postData: any) => {
    onSchedulePost(postData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Calendar</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <PostScheduleForm 
              onSubmit={handleSchedulePost}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-3">
                {getPostsForDate(selectedDate).map((post) => (
                  <div
                    key={post.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{post.title}</h4>
                      <Badge variant="secondary">{post.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(post.scheduled_for), 'h:mm a')}
                    </p>
                    <Badge 
                      variant={post.status === 'published' ? 'default' : 'outline'}
                    >
                      {post.status}
                    </Badge>
                  </div>
                ))}
                {getPostsForDate(selectedDate).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No posts scheduled for this date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a date to view scheduled posts
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveCalendar;
