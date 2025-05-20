
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';
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
import Signup from '../pages/Signup';
import SocialConnectCallback from '../components/social/SocialConnectCallback';
// Content pages
import ContentCalendarPage from '../pages/Content/ContentCalendarPage';
import ContentListPage from '../pages/Content/ContentListPage';
import ContentCreatePage from '../pages/Content/ContentCreatePage';
import ContentEditPage from '../pages/Content/ContentEditPage';
import ContentDetailPage from '../pages/Content/ContentDetailPage';
import ContentApprovalPage from '../pages/Content/ContentApprovalPage';
// Admin pages
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import CreateAdminUser from '../pages/CreateAdminUser';
// Brand pages
import CreatorDiscovery from '../pages/Brand/CreatorDiscovery';
import CampaignManagement from '../pages/Brand/CampaignManagement';

// Placeholder for pages that don't exist yet but will be implemented later
const PlaceholderPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="p-8 border rounded shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
      <p>This feature is currently under development and will be available soon.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Admin routes */}
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
      
      {/* Brand-specific routes */}
      <Route path="/creators" element={
        <ProtectedRoute>
          <CreatorDiscovery />
        </ProtectedRoute>
      } />
      
      <Route path="/campaigns" element={
        <ProtectedRoute>
          <CampaignManagement />
        </ProtectedRoute>
      } />
      
      {/* Public pages */}
      <Route path="/legal" element={<Legal />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms-conditions" element={<TermsAndConditions />} />
      
      {/* Placeholder routes for features mentioned in plans but not implemented yet */}
      <Route path="/content/caption-generator" element={<PlaceholderPage />} />
      <Route path="/content/engagement-predictor" element={<PlaceholderPage />} />
      <Route path="/content/brand-matchmaker" element={<PlaceholderPage />} />
      <Route path="/content/content-plan" element={<PlaceholderPage />} />
      <Route path="/content/smart-assistant" element={<PlaceholderPage />} />
      <Route path="/content/smart-scheduler" element={<PlaceholderPage />} />
      <Route path="/social-profiles" element={<PlaceholderPage />} />
      <Route path="/scheduler" element={<PlaceholderPage />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
