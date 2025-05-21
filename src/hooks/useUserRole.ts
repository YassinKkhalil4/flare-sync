
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
        setUserRole(null);
        setIsAdmin(false);
        setAdminTier(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First check if the user has a role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData && !roleError) {
          const role = roleData.role as UserRole;
          setUserRole(role);
          
          // Check if this is an admin role
          const isAdminRole = role === 'admin' || 
                              role === 'admin-owner' || 
                              role === 'admin-manager' || 
                              role === 'admin-support';
          
          setIsAdmin(isAdminRole);
          
          if (isAdminRole) {
            // Determine admin tier based on role
            if (role === 'admin-owner') setAdminTier('owner');
            else if (role === 'admin-manager') setAdminTier('manager');
            else if (role === 'admin-support') setAdminTier('support');
            else setAdminTier('standard');
          } else {
            setAdminTier(null);
          }
          
          setIsLoading(false);
          return;
        }

        // If not found in user_roles, check in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profileData && profileData.role) {
          const role = profileData.role as UserRole;
          setUserRole(role);
          
          // Check if this is an admin role in profile
          const isAdminRole = role === 'admin' || 
                              role === 'admin-owner' || 
                              role === 'admin-manager' || 
                              role === 'admin-support';
          
          setIsAdmin(isAdminRole);
          
          if (isAdminRole) {
            // Determine admin tier based on role
            if (role === 'admin-owner') setAdminTier('owner');
            else if (role === 'admin-manager') setAdminTier('manager');
            else if (role === 'admin-support') setAdminTier('support');
            else setAdminTier('standard');
          } else {
            setAdminTier(null);
          }
        } else {
          // Default to creator if not found
          setUserRole('creator');
          setIsAdmin(false);
          setAdminTier(null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        // Default to creator on error
        setUserRole('creator');
        setIsAdmin(false);
        setAdminTier(null);
      } finally {
        setIsLoading(false);
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
