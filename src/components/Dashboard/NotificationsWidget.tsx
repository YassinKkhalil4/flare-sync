
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsWidget = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
  // Only show the 5 most recent notifications
  const recentNotifications = notifications.slice(0, 5);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">
          Recent Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              {unreadCount}
            </span>
          )}
        </CardTitle>
        
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No notifications yet</p>
        ) : (
          <ul className="space-y-2">
            {recentNotifications.map(notification => (
              <li 
                key={notification.id} 
                className={`rounded-lg p-3 text-sm ${notification.is_read ? 'bg-background' : 'bg-muted'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true 
                      })}
                    </p>
                  </div>
                  
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      <span className="sr-only">Mark as read</span>
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsWidget;
