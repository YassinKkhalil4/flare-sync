
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import CreateAdminUser from '../pages/CreateAdminUser';
import Index from '../pages/Index';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import SocialConnect from '../pages/SocialConnect';
import CreatorProfile from '../pages/CreatorProfile';
import Messaging from '../pages/Messaging';
import BrandDeals from '../pages/BrandDeals';
import Plans from '../pages/Plans';
import PaymentHistory from '../pages/PaymentHistory';
import Settings from '../pages/Settings';
import NotificationsPage from '../pages/NotificationsPage';

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
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/social-connect" element={
        <ProtectedRoute>
          <SocialConnect />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <CreatorProfile />
        </ProtectedRoute>
      } />
      <Route path="/messaging" element={
        <ProtectedRoute>
          <Messaging />
        </ProtectedRoute>
      } />
      <Route path="/deals" element={
        <ProtectedRoute>
          <BrandDeals />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/plans" element={
        <ProtectedRoute>
          <Plans />
        </ProtectedRoute>
      } />
      <Route path="/payment-history" element={
        <ProtectedRoute>
          <PaymentHistory />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Placeholder pages that will be implemented later */}
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
      
      {/* Admin routes */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/create-user" element={<CreateAdminUser />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
