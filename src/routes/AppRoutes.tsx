
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import CreateAdminUser from '../pages/CreateAdminUser';

// Placeholder for pages that don't exist yet
const PlaceholderPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="p-8 border rounded shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Page Not Implemented</h1>
      <p>This page is part of the routes but hasn't been implemented yet.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage />} />
      <Route path="/profile/:username" element={<PlaceholderPage />} />
      <Route path="/social-profile/:id" element={<PlaceholderPage />} />
      <Route path="/legal" element={<PlaceholderPage />} />
      <Route path="/terms" element={<PlaceholderPage />} />
      <Route path="/privacy" element={<PlaceholderPage />} />
      <Route path="/contact" element={<PlaceholderPage />} />
      <Route path="/pricing" element={<PlaceholderPage />} />
      <Route path="/blog" element={<PlaceholderPage />} />
      <Route path="/blog/:id" element={<PlaceholderPage />} />
      <Route path="/auth" element={<PlaceholderPage />} />
      <Route path="/edit-profile" element={<PlaceholderPage />} />
      <Route path="/upgrade" element={<PlaceholderPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/create-user" element={<CreateAdminUser />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
