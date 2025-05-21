
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'creator' | 'brand' | 'admin' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setUserRole(null);
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
          setUserRole(roleData.role as UserRole);
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
          setUserRole(profileData.role as UserRole);
        } else {
          // Default to creator if not found
          setUserRole('creator');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        // Default to creator on error
        setUserRole('creator');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return { userRole, isLoading, error };
};
