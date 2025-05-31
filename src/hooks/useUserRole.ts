
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
          .eq('user_id', user.id)
          .single();

        console.log('useUserRole: user_roles query result:', { roleData, roleError });

        if (roleData && !roleError) {
          const role = roleData.role as UserRole;
          console.log('useUserRole: Found role in user_roles:', role);
          setUserRole(role);
          
          // Check if this is an admin role
          const isAdminRole = role === 'admin' || 
                              role === 'admin-owner' || 
                              role === 'admin-manager' || 
                              role === 'admin-support';
          
          console.log('useUserRole: Is admin role?', isAdminRole);
          setIsAdmin(isAdminRole);
          
          if (isAdminRole) {
            // Determine admin tier based on role
            let tier = 'standard';
            if (role === 'admin-owner') tier = 'owner';
            else if (role === 'admin-manager') tier = 'manager';
            else if (role === 'admin-support') tier = 'support';
            
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
              // If we have more specific tier information from admin_roles table, use that
              console.log('useUserRole: Using tier from admin_roles:', adminRoleData.tier);
              setAdminTier(adminRoleData.tier);
            }
          } else {
            setAdminTier(null);
          }
          
          setIsLoading(false);
          return;
        }

        // If not found in user_roles, check in profiles table
        console.log('useUserRole: Role not found in user_roles, checking profiles table');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('useUserRole: profiles query result:', { profileData, profileError });

        if (profileError) {
          console.error('useUserRole: Profile error:', profileError);
          throw profileError;
        }

        if (profileData && profileData.role) {
          const role = profileData.role as UserRole;
          console.log('useUserRole: Found role in profiles:', role);
          setUserRole(role);
          
          // Check if this is an admin role in profile
          const isAdminRole = role === 'admin' || 
                              role === 'admin-owner' || 
                              role === 'admin-manager' || 
                              role === 'admin-support';
          
          console.log('useUserRole: Is admin role from profile?', isAdminRole);
          setIsAdmin(isAdminRole);
          
          if (isAdminRole) {
            // Determine admin tier based on role
            let tier = 'standard';
            if (role === 'admin-owner') tier = 'owner';
            else if (role === 'admin-manager') tier = 'manager';
            else if (role === 'admin-support') tier = 'support';
            
            console.log('useUserRole: Admin tier from profile:', tier);
            setAdminTier(tier);
          } else {
            setAdminTier(null);
          }
        } else {
          // Default to creator if not found
          console.log('useUserRole: No role found, defaulting to creator');
          setUserRole('creator');
          setIsAdmin(false);
          setAdminTier(null);
        }
      } catch (err) {
        console.error('useUserRole: Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        // Default to creator on error
        setUserRole('creator');
        setIsAdmin(false);
        setAdminTier(null);
      } finally {
        setIsLoading(false);
        console.log('useUserRole: Final state:', { 
          userRole: userRole, 
          isAdmin: isAdmin, 
          adminTier: adminTier 
        });
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
