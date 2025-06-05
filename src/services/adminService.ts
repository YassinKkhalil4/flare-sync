
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalRevenue: number;
  monthlyGrowth: number;
  engagementRate: number;
}

export interface UserManagement {
  id: string;
  email: string;
  full_name?: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  total_posts: number;
  total_revenue: number;
}

export interface SystemHealth {
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'healthy' | 'degraded' | 'down';
  storageStatus: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  uptime: number;
}

export class AdminService {
  static async getDashboardStats(): Promise<AdminStats> {
    const { data, error } = await supabase.functions.invoke('admin-dashboard-stats');
    
    if (error) throw error;
    return data;
  }

  static async getUsers(limit?: number, offset?: number): Promise<{
    users: UserManagement[];
    total: number;
  }> {
    const { data, error } = await supabase.functions.invoke('admin-get-users', {
      body: { limit, offset }
    });
    
    if (error) throw error;
    return data;
  }

  static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('admin-update-user-status', {
      body: { userId, status }
    });
    
    if (error) throw error;
    return data.success;
  }

  static async updateUserPlan(userId: string, plan: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('admin-update-user-plan', {
      body: { userId, plan }
    });
    
    if (error) throw error;
    return data.success;
  }

  static async getSystemHealth(): Promise<SystemHealth> {
    const { data, error } = await supabase.functions.invoke('admin-system-health');
    
    if (error) throw error;
    return data;
  }

  static async getContentModeration(): Promise<any[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async moderateContent(postId: string, action: 'approve' | 'reject', reason?: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('admin-moderate-content', {
      body: { postId, action, reason }
    });
    
    if (error) throw error;
    return data.success;
  }

  static async getAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    const { data, error } = await supabase.functions.invoke('admin-analytics', {
      body: { period }
    });
    
    if (error) throw error;
    return data;
  }

  static async sendBroadcast(params: {
    title: string;
    message: string;
    userIds?: string[];
    type: 'notification' | 'email' | 'both';
  }): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('admin-send-broadcast', {
      body: params
    });
    
    if (error) throw error;
    return data.success;
  }
}
