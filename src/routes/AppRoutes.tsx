
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import CreateAdminUser from '../pages/CreateAdminUser';
import Index from '../pages/Index';
import Legal from '../pages/Legal';
import Privacy from '../pages/Privacy';
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
import TermsOfUse from '../pages/TermsOfUse';
import TermsAndConditions from '../pages/TermsAndConditions';
import Login from '../pages/Login';
import SocialConnectCallback from '../components/social/SocialConnectCallback';
// Content pages
import ContentCalendarPage from '../pages/Content/ContentCalendarPage';
import ContentListPage from '../pages/Content/ContentListPage';
import ContentCreatePage from '../pages/Content/ContentCreatePage';
import ContentEditPage from '../pages/Content/ContentEditPage';
import ContentDetailPage from '../pages/Content/ContentDetailPage';
import ContentApprovalPage from '../pages/Content/ContentApprovalPage';

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
  console.log('AppRoutes component rendering');
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin routes - making sure they are correctly defined */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/create-user" element={<CreateAdminUser />} />
      
      {/* Protected routes */}
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
      <Route path="/social-callback" element={
        <ProtectedRoute>
          <SocialConnectCallback />
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
      
      {/* Content Management Routes */}
      <Route path="/content" element={
        <ProtectedRoute>
          <ContentListPage />
        </ProtectedRoute>
      } />
      <Route path="/content/calendar" element={
        <ProtectedRoute>
          <ContentCalendarPage />
        </ProtectedRoute>
      } />
      <Route path="/content/create" element={
        <ProtectedRoute>
          <ContentCreatePage />
        </ProtectedRoute>
      } />
      <Route path="/content/edit/:id" element={
        <ProtectedRoute>
          <ContentEditPage />
        </ProtectedRoute>
      } />
      <Route path="/content/:id" element={
        <ProtectedRoute>
          <ContentDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/content/approval" element={
        <ProtectedRoute>
          <ContentApprovalPage />
        </ProtectedRoute>
      } />
      
      {/* Public pages */}
      <Route path="/legal" element={<Legal />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms-conditions" element={<TermsAndConditions />} />
      
      {/* Placeholder pages that will be implemented later */}
      <Route path="/profile/:username" element={<PlaceholderPage />} />
      <Route path="/social-profile/:id" element={<PlaceholderPage />} />
      <Route path="/contact" element={<PlaceholderPage />} />
      <Route path="/pricing" element={<PlaceholderPage />} />
      <Route path="/blog" element={<PlaceholderPage />} />
      <Route path="/blog/:id" element={<PlaceholderPage />} />
      <Route path="/auth" element={<PlaceholderPage />} />
      <Route path="/edit-profile" element={<PlaceholderPage />} />
      <Route path="/upgrade" element={<PlaceholderPage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
