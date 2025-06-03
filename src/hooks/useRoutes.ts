
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRoutesByRole, RouteConfig } from '@/config/routes';

export const useRoutes = () => {
  const { user } = useAuth();

  const availableRoutes = useMemo(() => {
    return getRoutesByRole(user?.role);
  }, [user?.role]);

  const navigationRoutes = useMemo(() => {
    return availableRoutes.filter(route => 
      route.requiresAuth && route.icon && !route.path.includes(':')
    );
  }, [availableRoutes]);

  const isRouteAccessible = (route: RouteConfig) => {
    if (!route.requiresAuth) return true;
    if (!user) return false;
    if (route.requiresRole && user.role !== route.requiresRole) return false;
    return true;
  };

  return {
    availableRoutes,
    navigationRoutes,
    isRouteAccessible
  };
};
