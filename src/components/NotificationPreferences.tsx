
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/api';
import { NotificationPreferences as NotificationPreferencesType } from '@/types/notification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const NotificationPreferences: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: NotificationService.getNotificationPreferences
  });

  const updatePreferences = useMutation({
    mutationFn: (newPreferences: Partial<NotificationPreferencesType>) => {
      if (!preferences) {
        throw new Error('No existing preferences found');
      }
      return NotificationService.updateNotificationPreferences({
        ...preferences,
        ...newPreferences
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    }
  });

  const handleToggle = (key: keyof NotificationPreferencesType, checked: boolean) => {
    if (preferences) {
      updatePreferences.mutate({ [key]: checked } as Partial<NotificationPreferencesType>);
    }
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  if (!preferences) {
    return <div>Failed to load notification preferences</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={preferences.email_enabled || false} 
                onCheckedChange={(checked) => handleToggle('email_enabled', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={preferences.push_enabled || false}
                onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="social-events">Social Media Events</Label>
                <p className="text-sm text-muted-foreground">Likes, comments, and mentions on social platforms</p>
              </div>
              <Switch 
                id="social-events" 
                checked={preferences.social_events_enabled || false}
                onCheckedChange={(checked) => handleToggle('social_events_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-alerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">Important system alerts and updates</p>
              </div>
              <Switch 
                id="system-alerts" 
                checked={preferences.system_alerts_enabled || false}
                onCheckedChange={(checked) => handleToggle('system_alerts_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="approval-requests">Approval Requests</Label>
                <p className="text-sm text-muted-foreground">Content approval requests and updates</p>
              </div>
              <Switch 
                id="approval-requests" 
                checked={preferences.approval_requests_enabled || false}
                onCheckedChange={(checked) => handleToggle('approval_requests_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="content-published">Content Published</Label>
                <p className="text-sm text-muted-foreground">Notifications when content is published</p>
              </div>
              <Switch 
                id="content-published" 
                checked={preferences.content_published_enabled || false}
                onCheckedChange={(checked) => handleToggle('content_published_enabled', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
