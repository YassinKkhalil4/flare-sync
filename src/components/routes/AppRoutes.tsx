
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PublicRoutes from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import AdminRoutes from './AdminRoutes';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      {!user ? (
        <PublicRoutes />
      ) : (
        <>
          <ProtectedRoutes />
          <AdminRoutes />
        </>
      )}
    </Router>
  );
};

export default AppRoutes;
