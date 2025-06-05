
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface EmailNotification {
  id: string;
  user_id: string;
  email: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  created_at: string;
}

export class EmailService {
  static async sendNotificationEmail(params: {
    userId: string;
    email: string;
    subject: string;
    content: string;
    templateId?: string;
    variables?: Record<string, string>;
  }): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: params
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }

  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getEmailHistory(userId?: string): Promise<EmailNotification[]> {
    let query = supabase
      .from('email_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async sendBulkEmail(params: {
    userIds: string[];
    subject: string;
    content: string;
    templateId?: string;
  }): Promise<{ success: number; failed: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      return { success: 0, failed: params.userIds.length };
    }
  }
}
