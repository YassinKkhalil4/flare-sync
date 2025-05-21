
import React, { useState } from 'react';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { TestNotification } from '@/components/TestNotification';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notification';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Trash2, Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);
  
  const displayNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread' 
      ? unreadNotifications 
      : readNotifications;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Notifications</CardTitle>
                {unreadNotifications.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => markAllAsRead()}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                )}
              </div>
              <CardDescription>
                Stay updated with all your creator activity
              </CardDescription>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications found</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {displayNotifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-4 flex items-start gap-4 ${!notification.is_read ? 'bg-muted' : ''}`}
                    >
                      {notification.image_url ? (
                        <img 
                          src={notification.image_url} 
                          alt="" 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center
                          ${notification.type === 'social_event' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'system_alert' ? 'bg-yellow-100 text-yellow-600' :
                            notification.type === 'approval_request' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'}
                        `}>
                          <Bell className="h-5 w-5" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <NotificationPreferences />
          {user && <TestNotification userId={user.id} />}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
