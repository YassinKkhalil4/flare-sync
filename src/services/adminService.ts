
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from './encryptionService';
import { useAuth } from '@/context/AuthContext';

// Admin permission type
export type AdminPermission = 'users_manage' | 'content_manage' | 'social_manage' | 'conversations_manage' | 'analytics_view' | 'admins_manage';

// Interface for the data structure returned from Supabase for admin users
interface AdminData {
  user_id: string;
  users?: {
    email?: string;
    created_at?: string;
  };
  profiles?: {
    full_name?: string;
  };
}

/**
 * Admin service for accessing encrypted data and managing admin operations
 */
class AdminService {
  /**
   * Check if the current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      return !error && roleData !== null;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get admin permissions for a user
   */
  async getAdminPermissions(adminId: string): Promise<AdminPermission[]> {
    try {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('admin_id', adminId);
        
      if (error) throw error;
      
      return data?.map(p => p.permission as AdminPermission) || [];
    } catch (error) {
      console.error('Error getting admin permissions:', error);
      return [];
    }
  }

  /**
   * Set admin permissions for a user
   */
  async setAdminPermissions(adminId: string, permissions: AdminPermission[]): Promise<boolean> {
    try {
      // First delete existing permissions
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('admin_id', adminId);
        
      // Then insert new permissions
      if (permissions.length > 0) {
        const { error } = await supabase
          .from('admin_permissions')
          .insert(permissions.map(permission => ({
            admin_id: adminId,
            permission
          })));
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error setting admin permissions:', error);
      return false;
    }
  }

  /**
   * Log admin access to sensitive data
   */
  private async logAdminAccess(
    adminId: string,
    action: 'view' | 'update' | 'delete',
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_access_logs')
        .insert({
          admin_id: adminId,
          action,
          resource_type: resourceType,
          resource_id: resourceId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log admin access:', error);
    }
  }

  /**
   * Get decrypted social profile data (admin only)
   */
  async getDecryptedSocialProfile(profileId: string): Promise<any | null> {
    if (!(await this.isAdmin())) {
      console.error('Admin access required');
      return null;
    }

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      await this.logAdminAccess(userId, 'view', 'social_profile', profileId);

      const { data: profile, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error || !profile) throw error;

      return encryptionService.decryptFields(profile, ['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Failed to get decrypted social profile:', error);
      return null;
    }
  }

  /**
   * Get admin access logs
   */
  async getAdminAccessLogs(): Promise<any[] | null> {
    if (!(await this.isAdmin())) {
      console.error('Admin access required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('admin_access_logs')
        .select(`
          id,
          admin_id,
          action,
          resource_type,
          resource_id,
          access_time,
          profiles!admin_id(
            full_name,
            username
          )
        `)
        .order('access_time', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get admin access logs:', error);
      return null;
    }
  }

  /**
   * Get all admin users with their permissions
   */
  async getAllAdmins(): Promise<any[] | null> {
    if (!(await this.isAdmin())) {
      console.error('Admin access required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!user_id(
            full_name,
            email
          )
        `)
        .eq('role', 'admin');

      if (error) throw error;
      
      // Get permissions for each admin
      const adminsWithPermissions = await Promise.all((data || []).map(async (admin) => {
        const permissions = await this.getAdminPermissions(admin.user_id);
        
        return {
          id: admin.user_id,
          email: admin.profiles?.email || '',
          full_name: admin.profiles?.full_name || '',
          permissions
        };
      }));
      
      return adminsWithPermissions;
    } catch (error) {
      console.error('Failed to get all admins:', error);
      return null;
    }
  }
  
  /**
   * Create a new admin user
   */
  async createAdminUser(email: string, password: string, fullName: string, permissions: AdminPermission[]): Promise<boolean> {
    if (!(await this.isAdmin())) {
      console.error('Admin access required');
      return false;
    }

    try {
      // Create user account
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      });
      
      if (userError || !userData?.user) {
        throw userError || new Error('Failed to create user');
      }

      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin'
        });
        
      if (roleError) throw roleError;

      // Set permissions
      await this.setAdminPermissions(userData.user.id, permissions);

      return true;
    } catch (error) {
      console.error('Failed to create admin user:', error);
      return false;
    }
  }
}

export const adminService = new AdminService();

// React hook for admin operations
export const useAdmin = () => {
  const { user } = useAuth();

  return {
    isAdmin: async (): Promise<boolean> => {
      if (!user) return false;
      return adminService.isAdmin();
    },
    getDecryptedSocialProfile: async (profileId: string) => {
      if (!user) return null;
      return adminService.getDecryptedSocialProfile(profileId);
    },
    getAdminAccessLogs: async () => {
      if (!user) return null;
      return adminService.getAdminAccessLogs();
    },
    getAdminPermissions: async (adminId: string = user?.id || '') => {
      if (!user) return [];
      return adminService.getAdminPermissions(adminId);
    },
    setAdminPermissions: async (adminId: string, permissions: AdminPermission[]) => {
      if (!user) return false;
      return adminService.setAdminPermissions(adminId, permissions);
    },
    getAllAdmins: async () => {
      if (!user) return null;
      return adminService.getAllAdmins();
    },
    createAdminUser: async (email: string, password: string, fullName: string, permissions: AdminPermission[]) => {
      if (!user) return false;
      return adminService.createAdminUser(email, password, fullName, permissions);
    },
    hasPermission: async (permission: AdminPermission): Promise<boolean> => {
      if (!user) return false;
      if (!(await adminService.isAdmin())) return false;
      
      const permissions = await adminService.getAdminPermissions(user.id);
      return permissions.includes(permission);
    }
  };
};
