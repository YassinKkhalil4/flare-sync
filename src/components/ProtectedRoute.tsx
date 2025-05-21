
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import { FeatureKey, useFeatureAccess } from '../hooks/useFeatureAccess';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAdminTier?: 'owner' | 'manager' | 'support' | 'standard';
  requireFeature?: FeatureKey;
  requireRole?: 'creator' | 'brand' | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireAdminTier = 'standard',
  requireFeature,
  requireRole
}) => {
  const { user, loading } = useAuth();
  const { isAdmin, adminTier, userRole, isLoading: roleLoading } = useUserRole();
  const { checkFeatureAccess } = useFeatureAccess();
  const location = useLocation();
  const [hasFeatureAccess, setHasFeatureAccess] = React.useState<boolean | null>(null);

  useEffect(() => {
    // Log route access for debugging
    console.log('Protected route access:', { 
      path: location.pathname, 
      user: user?.id, 
      isAdmin,
      adminTier,
      requireAdmin,
      requireAdminTier,
      requireFeature,
      requireRole
    });

    // Check for feature access if needed
    if (requireFeature && user) {
      checkFeatureAccess(requireFeature).then(hasAccess => {
        setHasFeatureAccess(hasAccess);
      });
    } else {
      setHasFeatureAccess(null); // No feature requirement
    }
  }, [location, user, isAdmin, adminTier, requireAdmin, requireAdminTier, requireFeature, requireRole, checkFeatureAccess]);

  const isLoading = loading || roleLoading || (requireFeature && hasFeatureAccess === null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the current path to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check for role requirement first
  if (requireRole && userRole !== requireRole) {
    console.log(`Access denied: Role ${requireRole} required, but user is ${userRole}`);
    return <Navigate to="/dashboard" replace />;
  }

  // Check for admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('Access denied: Admin access required for', location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  // Handle admin tier restrictions
  if (requireAdmin && isAdmin && requireAdminTier) {
    const hasRequiredTier = (() => {
      if (!adminTier) return false;
      
      switch (requireAdminTier) {
        case 'standard':
          return true; // All admins have standard access
        case 'support':
          return ['support', 'manager', 'owner'].includes(adminTier);
        case 'manager':
          return ['manager', 'owner'].includes(adminTier);
        case 'owner':
          return adminTier === 'owner';
        default:
          return false;
      }
    })();
    
    if (!hasRequiredTier) {
      console.log(`Access denied: Admin tier '${requireAdminTier}' required for ${location.pathname}, but user has '${adminTier}'`);
      return <Navigate to="/admin" replace />;
    }
  }

  // Check for feature access requirement
  if (requireFeature && hasFeatureAccess === false) {
    console.log(`Access denied: Feature ${requireFeature} required for ${location.pathname}, but not available in user's plan`);
    return <Navigate to="/plans" state={{ requiredFeature: requireFeature }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
