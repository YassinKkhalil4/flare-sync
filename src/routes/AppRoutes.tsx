
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';

// Public pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';

// Protected pages
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import CreatorProfile from '@/pages/CreatorProfile';
import BrandDeals from '@/pages/BrandDeals';
import Messaging from '@/pages/Messaging';
import Analytics from '@/pages/Analytics';
import Plans from '@/pages/Plans';
import Settings from '@/pages/Settings';
import SocialConnect from '@/pages/SocialConnect';
import PaymentHistory from '@/pages/PaymentHistory';
import NotificationsPage from '@/pages/NotificationsPage';
import ApiConfiguration from '@/pages/ApiConfiguration';

// Content pages
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentCalendarPage from '@/pages/Content/ContentCalendarPage';
import CaptionGeneratorPage from '@/pages/Content/CaptionGeneratorPage';
import EngagementPredictorPage from '@/pages/Content/EngagementPredictorPage';
import BrandMatchmakerPage from '@/pages/Content/BrandMatchmakerPage';
import ContentPlanGeneratorPage from '@/pages/Content/ContentPlanGeneratorPage';
import SmartAssistantPage from '@/pages/Content/SmartAssistantPage';

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';

// Legal pages
import Privacy from '@/pages/Privacy';
import TermsOfUse from '@/pages/TermsOfUse';
import Legal from '@/pages/Legal';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      
      {/* Legal routes */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/legal" element={<Legal />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content" element={
        <ProtectedRoute>
          <MainLayout>
            <Content />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/create" element={
        <ProtectedRoute>
          <MainLayout>
            <ContentCreatePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/calendar" element={
        <ProtectedRoute>
          <MainLayout>
            <ContentCalendarPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/caption-generator" element={
        <ProtectedRoute>
          <MainLayout>
            <CaptionGeneratorPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/engagement-predictor" element={
        <ProtectedRoute>
          <MainLayout>
            <EngagementPredictorPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/brand-matchmaker" element={
        <ProtectedRoute>
          <MainLayout>
            <BrandMatchmakerPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/content-plan-generator" element={
        <ProtectedRoute>
          <MainLayout>
            <ContentPlanGeneratorPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/content/smart-assistant" element={
        <ProtectedRoute>
          <MainLayout>
            <SmartAssistantPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <CreatorProfile />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/brand-deals" element={
        <ProtectedRoute>
          <MainLayout>
            <BrandDeals />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/messaging" element={
        <ProtectedRoute>
          <MainLayout>
            <Messaging />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/plans" element={
        <ProtectedRoute>
          <MainLayout>
            <Plans />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/social-connect" element={
        <ProtectedRoute>
          <MainLayout>
            <SocialConnect />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/payment-history" element={
        <ProtectedRoute>
          <MainLayout>
            <PaymentHistory />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/api-configuration" element={
        <ProtectedRoute>
          <MainLayout>
            <ApiConfiguration />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
