
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import { Notification } from '@/types/database';

interface NotificationsWidgetProps {
  limit?: number;
}

const NotificationsWidget = ({ limit = 5 }: NotificationsWidgetProps) => {
  const { notifications, unreadCount, isLoading } = useNotifications();
  
  // Get only the notifications up to the limit
  const limitedNotifications = notifications.slice(0, limit);
  
  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-md">Recent Notifications</CardTitle>
        <Link to="/notifications" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : limitedNotifications.length > 0 ? (
          <ul className="space-y-2">
            {limitedNotifications.map((notification: Notification) => (
              <li key={notification.id} className="rounded-md p-2 hover:bg-muted transition-colors">
                <div className="text-sm font-medium">{notification.title}</div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
            <p>No new notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsWidget;
