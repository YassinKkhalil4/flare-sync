
// Mock data for notifications and recent activity

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'message' | 'deal' | 'social' | 'content';
  isRead: boolean;
  timestamp: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  imageUrl?: string;
}

// Helper for generating recent timestamps
const getRecentTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

// Generate mock notifications
export const generateMockNotifications = (count: number = 10): Notification[] => {
  const notificationTypes: Notification['type'][] = ['system', 'message', 'deal', 'social', 'content'];
  const notifications: Notification[] = [];
  
  // Templates for each notification type
  const templates = {
    system: [
      { title: 'System Update', message: 'FlareSync has been updated with new features.' },
      { title: 'Account Security', message: 'We noticed a login from a new device.' },
      { title: 'Payment Processed', message: 'Your subscription has been renewed successfully.' },
      { title: 'Weekly Report', message: 'Your analytics report for this week is ready.' }
    ],
    message: [
      { title: 'New Message', message: 'Nike sent you a message about your recent campaign.' },
      { title: 'Message Notification', message: 'Sarah Williams replied to your conversation.' },
      { title: 'Unread Messages', message: 'You have 3 unread messages from brands.' }
    ],
    deal: [
      { title: 'New Deal Offer', message: 'Adidas has sent you a new collaboration offer.' },
      { title: 'Deal Update', message: 'Your deal with Puma has been accepted.' },
      { title: 'Deal Reminder', message: 'Your deal with Nike is due to complete in 3 days.' }
    ],
    social: [
      { title: 'Instagram Activity', message: 'Your latest post gained 500+ likes in 2 hours.' },
      { title: 'Profile Milestone', message: 'Congratulations on reaching 10K followers!' },
      { title: 'Platform Update', message: 'Instagram has new features available for creators.' }
    ],
    content: [
      { title: 'Post Published', message: 'Your scheduled post has been published to Instagram.' },
      { title: 'Content Approved', message: 'Your draft content has been approved by the team.' },
      { title: 'Analytics Alert', message: 'Your recent TikTok video is trending!' }
    ]
  };
  
  for (let i = 0; i < count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const template = templates[type][Math.floor(Math.random() * templates[type].length)];
    const hoursAgo = i * 2 + Math.floor(Math.random() * 3); // Spread out notifications
    
    notifications.push({
      id: `notif-${i+1}`,
      title: template.title,
      message: template.message,
      type,
      isRead: Math.random() > 0.3, // 30% chance of being unread
      timestamp: getRecentTimestamp(hoursAgo),
      relatedEntityType: type === 'system' ? undefined : type,
      relatedEntityId: type === 'system' ? undefined : `${type}-${i+1}`,
      imageUrl: type === 'message' || type === 'deal' ? `https://api.dicebear.com/6.x/identicon/svg?seed=${i}` : undefined
    });
  }
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

