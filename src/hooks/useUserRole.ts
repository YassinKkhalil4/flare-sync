
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

        // Check user_roles table for any roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          setError(roleError.message);
          
          // Fallback to creator role on error
          setUserRole('creator');
          setIsAdmin(false);
          setAdminTier(null);
          setIsLoading(false);
          return;
        }

        if (roleData && roleData.length > 0) {
          // Look for admin roles first
          const adminRole = roleData.find(r => 
            r.role === 'admin-owner' || 
            r.role === 'admin-manager' || 
            r.role === 'admin-support' || 
            r.role === 'admin'
          );
          
          if (adminRole) {
            setUserRole(adminRole.role as UserRole);
            setIsAdmin(true);
            
            // Set admin tier
            let tier = 'standard';
            if (adminRole.role === 'admin-owner') tier = 'owner';
            else if (adminRole.role === 'admin-manager') tier = 'manager';
            else if (adminRole.role === 'admin-support') tier = 'support';
            
            setAdminTier(tier);
            setIsLoading(false);
            return;
          }
          
          // If no admin role, use the first regular role
          const regularRole = roleData[0].role as UserRole;
          setUserRole(regularRole);
          setIsAdmin(false);
          setAdminTier(null);
          setIsLoading(false);
          return;
        }

        // No roles found in user_roles table - fallback to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && profileData.role) {
          const role = profileData.role as UserRole;
          setUserRole(role);
          setIsAdmin(false);
          setAdminTier(null);
        } else {
          // Default to creator
          setUserRole('creator');
          setIsAdmin(false);
          setAdminTier(null);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        setUserRole('creator');
        setIsAdmin(false);
        setAdminTier(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  const hasAdminPermission = (requiredTier: 'owner' | 'manager' | 'support' | 'standard'): boolean => {
    if (!isAdmin || !adminTier) return false;
    
    switch (requiredTier) {
      case 'standard':
        return true;
      case 'support':
        return ['support', 'manager', 'owner'].includes(adminTier);
      case 'manager':
        return ['manager', 'owner'].includes(adminTier);
      case 'owner':
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
