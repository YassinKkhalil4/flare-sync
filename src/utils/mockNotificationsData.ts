
// Mock data for notifications and recent activity
import { Notification } from '@/types/notification';

// Helper for generating recent timestamps
const getRecentTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

// Generate mock notifications
export const generateMockNotifications = (count: number = 10): Notification[] => {
  const types: string[] = ['social_event', 'system_alert', 'approval_request', 'content_published'];
  const notifications: Notification[] = [];
  
  // Templates for each notification type
  const templates = {
    social_event: [
      { title: 'Instagram Activity', message: 'Your latest post gained 500+ likes in 2 hours.' },
      { title: 'Profile Milestone', message: 'Congratulations on reaching 10K followers!' },
      { title: 'Platform Update', message: 'Instagram has new features available for creators.' }
    ],
    system_alert: [
      { title: 'System Update', message: 'FlareSync has been updated with new features.' },
      { title: 'Account Security', message: 'We noticed a login from a new device.' },
      { title: 'Payment Processed', message: 'Your subscription has been renewed successfully.' },
      { title: 'Weekly Report', message: 'Your analytics report for this week is ready.' }
    ],
    approval_request: [
      { title: 'New Deal Offer', message: 'Adidas has sent you a new collaboration offer.' },
      { title: 'Deal Update', message: 'Your deal with Puma has been accepted.' },
      { title: 'Deal Reminder', message: 'Your deal with Nike is due to complete in 3 days.' }
    ],
    content_published: [
      { title: 'Post Published', message: 'Your scheduled post has been published to Instagram.' },
      { title: 'Content Approved', message: 'Your draft content has been approved by the team.' },
      { title: 'Analytics Alert', message: 'Your recent TikTok video is trending!' }
    ]
  };
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)] as any;
    const template = templates[type][Math.floor(Math.random() * templates[type].length)];
    const hoursAgo = i * 2 + Math.floor(Math.random() * 3); // Spread out notifications
    
    notifications.push({
      id: `notif-${i+1}`,
      title: template.title,
      message: template.message,
      type,
      is_read: Math.random() > 0.3, // 30% chance of being unread
      created_at: getRecentTimestamp(hoursAgo),
      user_id: 'mock-user-id',
      related_entity_type: type === 'system_alert' ? undefined : type,
      related_entity_id: type === 'system_alert' ? undefined : `${type}-${i+1}`,
      image_url: type === 'approval_request' ? `https://api.dicebear.com/6.x/identicon/svg?seed=${i}` : undefined
    });
  }
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
