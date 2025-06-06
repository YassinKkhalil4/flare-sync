
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminBilling from '@/pages/admin/AdminBilling';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminTesting from '@/pages/admin/AdminTesting';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute requireAdmin={true}><AdminContent /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute requireAdmin={true}><AdminBilling /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin={true}><AdminNotifications /></ProtectedRoute>} />
      <Route path="/admin/testing" element={<ProtectedRoute requireAdmin={true}><AdminTesting /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminRoutes;
