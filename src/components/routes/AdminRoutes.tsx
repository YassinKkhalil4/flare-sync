
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireRole="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute requireRole="admin"><AdminContent /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminRoutes;
