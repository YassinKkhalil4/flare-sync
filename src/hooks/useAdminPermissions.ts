
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

export type AdminPermission = 
  | 'can_manage_users'
  | 'can_manage_content'
  | 'can_manage_plans'
  | 'can_access_billing';

export interface AdminRole {
  id: string;
  user_id: string;
  tier: 'owner' | 'manager' | 'support' | 'standard';
  can_manage_users: boolean;
  can_manage_content: boolean;
  can_manage_plans: boolean;
  can_access_billing: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const { isAdmin, adminTier } = useUserRole();
  const queryClient = useQueryClient();
  
  // Fetch admin permissions for the current user
  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['adminPermissions', user?.id],
    queryFn: async () => {
      if (!user || !isAdmin) return null;
      
      // If user is admin-owner, they have all permissions automatically
      if (adminTier === 'owner') {
        return {
          id: 'auto-generated-owner',
          user_id: user.id,
          tier: 'owner' as const,
          can_manage_users: true,
          can_manage_content: true,
          can_manage_plans: true,
          can_access_billing: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as AdminRole;
      }
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching admin permissions:', error);
        
        // Create default permissions based on admin tier
        const defaultPermissions = {
          id: 'auto-generated',
          user_id: user.id,
          tier: adminTier as 'owner' | 'manager' | 'support' | 'standard',
          can_manage_users: adminTier === 'manager' || adminTier === 'owner',
          can_manage_content: true, // All admins can manage content
          can_manage_plans: adminTier === 'owner',
          can_access_billing: adminTier === 'manager' || adminTier === 'owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as AdminRole;
        
        return defaultPermissions;
      }
      
      return data as AdminRole;
    },
    enabled: !!user && isAdmin
  });

  // Get all admin roles for admin management (owner only)
  const { data: allAdminRoles } = useQuery({
    queryKey: ['allAdminRoles'],
    queryFn: async () => {
      if (!user || adminTier !== 'owner') return [];
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select(`
          *,
          user_roles!user_id(role),
          profiles!user_id(full_name, email)
        `);
        
      if (error) {
        console.error('Error fetching all admin roles:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user && adminTier === 'owner'
  });

  // Check if the current admin has a specific permission
  const hasPermission = (permissionName: AdminPermission): boolean => {
    if (!permissions || !isAdmin) return false;
    
    // Admin-owner always has all permissions
    if (adminTier === 'owner') return true;
    
    return !!permissions[permissionName];
  };

  // Based on tier, automatically grant permissions
  const checkTierPermission = (permissionName: AdminPermission): boolean => {
    if (!isAdmin || !adminTier) return false;
    
    switch (adminTier) {
      case 'owner':
        // Owner has all permissions
        return true;
      case 'manager':
        // Managers can manage content and users, but not plans or billing
        return permissionName === 'can_manage_content' || 
               permissionName === 'can_manage_users';
      case 'support':
        // Support can only manage content
        return permissionName === 'can_manage_content';
      default:
        // Standard admins have no default permissions
        return false;
    }
  };

  // Update permissions for an admin (owner only)
  const updateAdminPermissions = useMutation({
    mutationFn: async (params: { 
      adminId: string, 
      permissions: Partial<Record<AdminPermission, boolean>> 
    }) => {
      const { adminId, permissions } = params;
      
      const { data, error } = await supabase
        .from('admin_roles')
        .update(permissions)
        .eq('user_id', adminId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPermissions'] });
      queryClient.invalidateQueries({ queryKey: ['allAdminRoles'] });
      
      toast({
        title: "Permissions Updated",
        description: "Admin permissions have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating admin permissions:', error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update admin permissions.",
        variant: "destructive",
      });
    }
  });

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    checkTierPermission,
    updateAdminPermissions,
    allAdminRoles
  };
};
