
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// External landing page URL
const LANDING_PAGE_URL = "https://flaresync.org";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const [forceTimeout, setForceTimeout] = useState(false);

  // Force timeout after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  // For debugging purposes, let's log the auth state
  console.log('Protected route auth state:', { user, isLoading, forceTimeout });

  // If loading and timeout not reached, show loading spinner
  if (isLoading && !forceTimeout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // IMPORTANT FIX: Only redirect to external site if we're sure the user is not authenticated
  // This check should be more precise to prevent unnecessary redirects
  if (!user && !isLoading) {
    console.log('User not authenticated, redirecting to login');
    // For development purposes, let's navigate to /login instead of external redirect
    return <Navigate to="/login" />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/" />;
  }

  console.log('User authenticated, rendering protected content');
  // If we have a user, render the children or outlet
  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
