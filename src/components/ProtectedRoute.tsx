
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

  // If not logged in or timeout reached without user, redirect to external landing page
  if (!user) {
    // Redirect to the external landing page instead of the local login
    window.location.href = LANDING_PAGE_URL;
    // Return loading state while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  // If we have a user or forced timeout, render the children or outlet
  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
