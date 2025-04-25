
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

  // If not logged in or timeout reached without user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If we have a user or forced timeout, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
