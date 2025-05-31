
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'creator' | 'brand' | 'admin' | 'admin-owner' | 'admin-manager' | 'admin-support' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTier, setAdminTier] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        console.log('useUserRole: No user ID, resetting state');
        setUserRole(null);
        setIsAdmin(false);
        setAdminTier(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('useUserRole: Fetching role for user:', user.id);
        setIsLoading(true);
        setError(null);

        // First check if the user has a role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        console.log('useUserRole: user_roles query result:', { roleData, roleError });

        let foundAdminRole = false;
        let primaryRole: UserRole = null;

        if (roleData && !roleError && roleData.length > 0) {
          // Check if any of the roles is an admin role
          const adminRole = roleData.find(r => 
            r.role === 'admin-owner' || 
            r.role === 'admin-manager' || 
            r.role === 'admin-support' || 
            r.role === 'admin'
          );
          
          if (adminRole) {
            foundAdminRole = true;
            primaryRole = adminRole.role as UserRole;
            console.log('useUserRole: Found admin role:', adminRole.role);
          } else {
            // Use the first non-admin role
            primaryRole = roleData[0].role as UserRole;
            console.log('useUserRole: Found regular role:', primaryRole);
          }
        }

        // If admin role found, set admin state
        if (foundAdminRole && primaryRole) {
          setUserRole(primaryRole);
          setIsAdmin(true);
          
          // Determine admin tier based on role
          let tier = 'standard';
          if (primaryRole === 'admin-owner') tier = 'owner';
          else if (primaryRole === 'admin-manager') tier = 'manager';
          else if (primaryRole === 'admin-support') tier = 'support';
          
          console.log('useUserRole: Admin tier determined:', tier);
          setAdminTier(tier);

          // Also check the admin_roles table for more detailed permissions
          const { data: adminRoleData, error: adminRoleError } = await supabase
            .from('admin_roles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          console.log('useUserRole: admin_roles query result:', { adminRoleData, adminRoleError });
            
          if (adminRoleData && !adminRoleError) {
            console.log('useUserRole: Using tier from admin_roles:', adminRoleData.tier);
            setAdminTier(adminRoleData.tier);
          }
          
          setIsLoading(false);
          return;
        }

        // If no admin role found in user_roles, check profiles table as fallback
        if (!foundAdminRole) {
          console.log('useUserRole: No admin role in user_roles, checking profiles table');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          console.log('useUserRole: profiles query result:', { profileData, profileError });

          if (profileData && profileData.role) {
            primaryRole = profileData.role as UserRole;
            console.log('useUserRole: Found role in profiles:', primaryRole);
          } else {
            // Default to creator if not found anywhere
            console.log('useUserRole: No role found anywhere, defaulting to creator');
            primaryRole = 'creator';
          }
        }

        setUserRole(primaryRole);
        setIsAdmin(false);
        setAdminTier(null);

      } catch (err) {
        console.error('useUserRole: Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        // Default to creator on error
        setUserRole('creator');
        setIsAdmin(false);
        setAdminTier(null);
      } finally {
        setIsLoading(false);
        console.log('useUserRole: Final state - userRole:', userRole, 'isAdmin:', isAdmin, 'adminTier:', adminTier);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  // Check if user has specific admin permissions
  const hasAdminPermission = (requiredTier: 'owner' | 'manager' | 'support' | 'standard'): boolean => {
    if (!isAdmin || !adminTier) return false;
    
    switch (requiredTier) {
      case 'standard':
        // All admin tiers have standard permissions
        return true;
      case 'support':
        // Only support, manager and owner have support permissions
        return ['support', 'manager', 'owner'].includes(adminTier);
      case 'manager':
        // Only manager and owner have manager permissions
        return ['manager', 'owner'].includes(adminTier);
      case 'owner':
        // Only owner has owner permissions
        return adminTier === 'owner';
      default:
        return false;
    }
  };

  return { 
    userRole, 
    isLoading, 
    error, 
    isAdmin, 
    adminTier,
    hasAdminPermission
  };
};
