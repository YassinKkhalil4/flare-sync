
export interface Notification {
  id: string;
  type: string; // Changed from NotificationType to string to match database type
  title: string;
  message: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export type NotificationType = 'social_event' | 'system_alert' | 'approval_request' | 'content_published';

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  social_events_enabled: boolean;
  system_alerts_enabled: boolean;
  approval_requests_enabled: boolean;
  content_published_enabled: boolean;
}
