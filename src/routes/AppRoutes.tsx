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
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminBilling from '@/pages/admin/AdminBilling';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminTesting from '@/pages/admin/AdminTesting';

// Legal pages
import Privacy from '@/pages/Privacy';
import TermsOfUse from '@/pages/TermsOfUse';
import Legal from '@/pages/Legal';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <RouteErrorBoundary routeName="Landing">
          {user ? <Navigate to="/dashboard" replace /> : <Landing />}
        </RouteErrorBoundary>
      } />
      
      <Route path="/login" element={
        <RouteErrorBoundary routeName="Login">
          {user ? <Navigate to="/dashboard" replace /> : <Login />}
        </RouteErrorBoundary>
      } />
      
      <Route path="/signup" element={
        <RouteErrorBoundary routeName="Signup">
          {user ? <Navigate to="/dashboard" replace /> : <Signup />}
        </RouteErrorBoundary>
      } />
      
      {/* Legal routes */}
      <Route path="/privacy" element={
        <RouteErrorBoundary routeName="Privacy">
          <Privacy />
        </RouteErrorBoundary>
      } />
      
      <Route path="/terms" element={
        <RouteErrorBoundary routeName="Terms">
          <TermsOfUse />
        </RouteErrorBoundary>
      } />
      
      <Route path="/legal" element={
        <RouteErrorBoundary routeName="Legal">
          <Legal />
        </RouteErrorBoundary>
      } />

      {/* Protected routes - all wrapped with error boundaries */}
      <Route path="/dashboard" element={
        <RouteErrorBoundary routeName="Dashboard">
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content" element={
        <RouteErrorBoundary routeName="Content">
          <ProtectedRoute>
            <MainLayout>
              <Content />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/create" element={
        <RouteErrorBoundary routeName="Content Create">
          <ProtectedRoute>
            <MainLayout>
              <ContentCreatePage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/calendar" element={
        <RouteErrorBoundary routeName="Content Calendar">
          <ProtectedRoute>
            <MainLayout>
              <ContentCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/caption-generator" element={
        <RouteErrorBoundary routeName="Caption Generator">
          <ProtectedRoute>
            <MainLayout>
              <CaptionGeneratorPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/engagement-predictor" element={
        <RouteErrorBoundary routeName="Engagement Predictor">
          <ProtectedRoute>
            <MainLayout>
              <EngagementPredictorPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/brand-matchmaker" element={
        <RouteErrorBoundary routeName="Brand Matchmaker">
          <ProtectedRoute>
            <MainLayout>
              <BrandMatchmakerPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/content-plan-generator" element={
        <RouteErrorBoundary routeName="Content Plan Generator">
          <ProtectedRoute>
            <MainLayout>
              <ContentPlanGeneratorPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/content/smart-assistant" element={
        <RouteErrorBoundary routeName="Smart Assistant">
          <ProtectedRoute>
            <MainLayout>
              <SmartAssistantPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/profile" element={
        <RouteErrorBoundary routeName="Profile">
          <ProtectedRoute>
            <MainLayout>
              <CreatorProfile />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/brand-deals" element={
        <RouteErrorBoundary routeName="Brand Deals">
          <ProtectedRoute>
            <MainLayout>
              <BrandDeals />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/messaging" element={
        <RouteErrorBoundary routeName="Messaging">
          <ProtectedRoute>
            <MainLayout>
              <Messaging />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/analytics" element={
        <RouteErrorBoundary routeName="Analytics">
          <ProtectedRoute>
            <MainLayout>
              <Analytics />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/plans" element={
        <RouteErrorBoundary routeName="Plans">
          <ProtectedRoute>
            <MainLayout>
              <Plans />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/settings" element={
        <RouteErrorBoundary routeName="Settings">
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/social-connect" element={
        <RouteErrorBoundary routeName="Social Connect">
          <ProtectedRoute>
            <MainLayout>
              <SocialConnect />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/payment-history" element={
        <RouteErrorBoundary routeName="Payment History">
          <ProtectedRoute>
            <MainLayout>
              <PaymentHistory />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/notifications" element={
        <RouteErrorBoundary routeName="Notifications">
          <ProtectedRoute>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      <Route path="/api-configuration" element={
        <RouteErrorBoundary routeName="API Configuration">
          <ProtectedRoute>
            <MainLayout>
              <ApiConfiguration />
            </MainLayout>
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      {/* Admin routes */}
      <Route path="/admin/login" element={
        <RouteErrorBoundary routeName="Admin Login">
          <AdminLogin />
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin" element={
        <RouteErrorBoundary routeName="Admin Dashboard">
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/users" element={
        <RouteErrorBoundary routeName="Admin Users">
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/content" element={
        <RouteErrorBoundary routeName="Admin Content">
          <ProtectedRoute requireAdmin>
            <AdminContent />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/analytics" element={
        <RouteErrorBoundary routeName="Admin Analytics">
          <ProtectedRoute requireAdmin>
            <AdminAnalytics />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/billing" element={
        <RouteErrorBoundary routeName="Admin Billing">
          <ProtectedRoute requireAdmin>
            <AdminBilling />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/notifications" element={
        <RouteErrorBoundary routeName="Admin Notifications">
          <ProtectedRoute requireAdmin>
            <AdminNotifications />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />
      
      <Route path="/admin/testing" element={
        <RouteErrorBoundary routeName="Admin Testing">
          <ProtectedRoute requireAdmin>
            <AdminTesting />
          </ProtectedRoute>
        </RouteErrorBoundary>
      } />

      {/* 404 route */}
      <Route path="*" element={
        <RouteErrorBoundary routeName="404">
          <NotFound />
        </RouteErrorBoundary>
      } />
    </Routes>
  );
};

export default AppRoutes;
