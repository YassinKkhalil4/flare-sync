
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NotificationType } from '@/types/notification';

export const TestNotification: React.FC<{ userId: string }> = ({ userId }) => {
  const [type, setType] = useState<NotificationType>('system_alert');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast({
        title: 'Missing information',
        description: 'Please fill in both title and message fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          userId,
          type,
          title,
          message,
        }
      });

      toast({
        title: 'Notification sent',
        description: 'Your test notification has been sent successfully.',
      });

      // Reset form
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Test Notification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select value={type} onValueChange={(value: NotificationType) => setType(value)}>
            <SelectTrigger id="notification-type">
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social_event">Social Event</SelectItem>
              <SelectItem value="system_alert">System Alert</SelectItem>
              <SelectItem value="approval_request">Approval Request</SelectItem>
              <SelectItem value="content_published">Content Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-title">Title</Label>
          <Input
            id="notification-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-message">Message</Label>
          <Textarea
            id="notification-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message"
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleSendNotification} 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Test Notification'}
        </Button>
      </CardContent>
    </Card>
  );
};
