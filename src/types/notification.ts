
export type NotificationType = 'social_event' | 'system_alert' | 'approval_request' | 'content_published';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
  image_url?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  social_events_enabled: boolean;
  system_alerts_enabled: boolean;
  approval_requests_enabled: boolean;
  content_published_enabled: boolean;
  updated_at?: string;
}
