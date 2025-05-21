
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
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
import Analytics from '../pages/Analytics';
// Content pages
import ContentCalendarPage from '../pages/Content/ContentCalendarPage';
import ContentListPage from '../pages/Content/ContentListPage';
import ContentCreatePage from '../pages/Content/ContentCreatePage';
import ContentEditPage from '../pages/Content/ContentEditPage';
import ContentDetailPage from '../pages/Content/ContentDetailPage';
import ContentApprovalPage from '../pages/Content/ContentApprovalPage';
// Brand pages
import CreatorDiscovery from '../pages/Brand/CreatorDiscovery';
import CampaignManagement from '../pages/Brand/CampaignManagement';
import BrandMatchmakerPage from '../pages/Content/BrandMatchmakerPage';
// AI Feature Pages
import CaptionGeneratorPage from '../pages/Content/CaptionGeneratorPage';
import EngagementPredictorPage from '../pages/Content/EngagementPredictorPage';
import ContentPlanGeneratorPage from '../pages/Content/ContentPlanGeneratorPage';
import SmartAssistantPage from '../pages/Content/SmartAssistantPage';
import SmartPostSchedulerPage from '../pages/Content/SmartPostSchedulerPage';
import { useAuth } from '../context/AuthContext';
import Landing from '../pages/Landing';
// Admin pages
import AdminDashboard from '../pages/AdminDashboard';

// Route guard that redirects authenticated users away from auth pages
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (user) {
    // If user is coming from a specific path and trying to access auth pages
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth routes - redirect to dashboard if already logged in */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      
      <Route path="/signup" element={
        <AuthRoute>
          <Signup />
        </AuthRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
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

      {/* Analytics Route */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
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
      
      {/* AI Feature Routes */}
      <Route path="/content/caption-generator" element={
        <ProtectedRoute>
          <CaptionGeneratorPage />
        </ProtectedRoute>
      } />
      
      <Route path="/content/engagement-predictor" element={
        <ProtectedRoute>
          <EngagementPredictorPage />
        </ProtectedRoute>
      } />
      
      <Route path="/content/content-plan" element={
        <ProtectedRoute>
          <ContentPlanGeneratorPage />
        </ProtectedRoute>
      } />
      
      <Route path="/content/smart-assistant" element={
        <ProtectedRoute>
          <SmartAssistantPage />
        </ProtectedRoute>
      } />
      
      <Route path="/content/smart-scheduler" element={
        <ProtectedRoute>
          <SmartPostSchedulerPage />
        </ProtectedRoute>
      } />

      {/* Brand Matchmaker page */}
      <Route path="/content/brand-matchmaker" element={
        <ProtectedRoute>
          <BrandMatchmakerPage />
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
      
      {/* Social profiles shortcut */}
      <Route path="/social-profiles" element={
        <ProtectedRoute>
          <SocialConnect />
        </ProtectedRoute>
      } />
      
      <Route path="/scheduler" element={
        <ProtectedRoute>
          <ContentCalendarPage />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
