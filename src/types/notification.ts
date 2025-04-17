
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'social_event' | 'system_alert' | 'approval_request' | 'content_published';
  is_read: boolean;
  image_url?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}
