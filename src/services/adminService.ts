
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from './encryptionService';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin service for accessing encrypted data
 * This should only be used by administrators
 */
class AdminService {
  /**
   * Check if the current user is an admin
   * @returns Promise<boolean> True if user is admin
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
   * Log admin access to sensitive data
   * @param adminId The admin's user ID
   * @param action The action performed
   * @param resourceType The type of resource accessed
   * @param resourceId The ID of the resource accessed
   */
  async logAdminAccess(
    adminId: string,
    action: 'view' | 'update' | 'delete',
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    try {
      await supabase
        .from('admin_access_logs')
        .insert({
          admin_id: adminId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          access_time: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log admin access:', error);
    }
  }

  /**
   * Get decrypted social profile data (admin only)
   * @param profileId The ID of the social profile
   * @returns The decrypted profile data or null
   */
  async getDecryptedSocialProfile(profileId: string): Promise<any | null> {
    if (!(await this.isAdmin())) {
      console.error('Admin access required');
      return null;
    }

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('Not authenticated');
      }

      // Log this admin access
      await this.logAdminAccess(
        userId, 
        'view', 
        'social_profile', 
        profileId
      );

      // Retrieve the encrypted data
      return encryptionService.retrieveAndDecryptData(
        'social_profiles',
        { id: profileId },
        ['access_token', 'refresh_token']
      );
    } catch (error) {
      console.error('Failed to get decrypted social profile:', error);
      return null;
    }
  }

  /**
   * Get all admin access logs
   * @returns Array of access logs or null
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
          profiles:admin_id (
            full_name,
            username
          )
        `)
        .order('access_time', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get admin access logs:', error);
      return null;
    }
  }
}

export const adminService = new AdminService();

// React hook for admin operations
export const useAdmin = () => {
  const { user } = useAuth();

  return {
    isAdmin: async () => {
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
  };
};
