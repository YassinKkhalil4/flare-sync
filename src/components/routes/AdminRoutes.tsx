
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute requireAdmin={true}><AdminContent /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminRoutes;
