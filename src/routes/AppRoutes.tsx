
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Index from '@/pages/Index';
import CreatorProfile from '@/pages/CreatorProfile';
import Plans from '@/pages/Plans';
import Settings from '@/pages/Settings';
import PaymentHistory from '@/pages/PaymentHistory';
import AdminDashboard from '@/pages/AdminDashboard';
import BrandDeals from '@/pages/BrandDeals';
import Messaging from '@/pages/Messaging';
import NotificationsPage from '@/pages/NotificationsPage';
import Analytics from '@/pages/Analytics';
import SocialConnect from '@/pages/SocialConnect';
import ApiKeysSetup from '@/pages/ApiKeysSetup';
import ApiConfiguration from '@/pages/ApiConfiguration';

// Content pages
import ContentPage from '@/pages/Content/ContentPage';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentListPage from '@/pages/Content/ContentListPage';
import ContentEditPage from '@/pages/Content/ContentEditPage';
import ContentDetailPage from '@/pages/Content/ContentDetailPage';
import ContentCalendarPage from '@/pages/Content/ContentCalendarPage';
import ContentApprovalPage from '@/pages/Content/ContentApprovalPage';
import SmartPostSchedulerPage from '@/pages/Content/SmartPostSchedulerPage';
import SmartSchedulerPage from '@/pages/Content/SmartSchedulerPage';
import CaptionGeneratorPage from '@/pages/Content/CaptionGeneratorPage';
import EngagementPredictorPage from '@/pages/Content/EngagementPredictorPage';
import BrandMatchmakerPage from '@/pages/Content/BrandMatchmakerPage';
import SmartAssistantPage from '@/pages/Content/SmartAssistantPage';
import ContentPlanGeneratorPage from '@/pages/Content/ContentPlanGeneratorPage';

// Brand pages
import CreatorDiscoveryPage from '@/pages/Brand/CreatorDiscoveryPage';
import CampaignManagementPage from '@/pages/Brand/CampaignManagementPage';

// Legal pages
import Legal from '@/pages/Legal';
import Privacy from '@/pages/Privacy';
import TermsOfUse from '@/pages/TermsOfUse';
import TermsAndConditions from '@/pages/TermsAndConditions';

// 404 page
import NotFound from '@/pages/NotFound';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      
      {/* Legal routes */}
      <Route path="/legal" element={<Legal />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><CreatorProfile /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/deals" element={<ProtectedRoute><BrandDeals /></ProtectedRoute>} />
      <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/social-connect" element={<ProtectedRoute><SocialConnect /></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute><ApiKeysSetup /></ProtectedRoute>} />
      <Route path="/api-configuration" element={<ProtectedRoute><ApiConfiguration /></ProtectedRoute>} />

      {/* Content routes */}
      <Route path="/content" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
      <Route path="/content/create" element={<ProtectedRoute><ContentCreatePage /></ProtectedRoute>} />
      <Route path="/content/list" element={<ProtectedRoute><ContentListPage /></ProtectedRoute>} />
      <Route path="/content/edit/:id" element={<ProtectedRoute><ContentEditPage /></ProtectedRoute>} />
      <Route path="/content/detail/:id" element={<ProtectedRoute><ContentDetailPage /></ProtectedRoute>} />
      <Route path="/content/calendar" element={<ProtectedRoute><ContentCalendarPage /></ProtectedRoute>} />
      <Route path="/content/approval" element={<ProtectedRoute><ContentApprovalPage /></ProtectedRoute>} />
      <Route path="/content/smart-post-scheduler" element={<ProtectedRoute><SmartPostSchedulerPage /></ProtectedRoute>} />
      <Route path="/content/smart-scheduler" element={<ProtectedRoute><SmartSchedulerPage /></ProtectedRoute>} />
      <Route path="/content/caption-generator" element={<ProtectedRoute><CaptionGeneratorPage /></ProtectedRoute>} />
      <Route path="/content/engagement-predictor" element={<ProtectedRoute><EngagementPredictorPage /></ProtectedRoute>} />
      <Route path="/content/brand-matchmaker" element={<ProtectedRoute><BrandMatchmakerPage /></ProtectedRoute>} />
      <Route path="/content/smart-assistant" element={<ProtectedRoute><SmartAssistantPage /></ProtectedRoute>} />
      <Route path="/content/plan-generator" element={<ProtectedRoute><ContentPlanGeneratorPage /></ProtectedRoute>} />

      {/* Brand routes */}
      <Route path="/brand/discovery" element={<ProtectedRoute><CreatorDiscoveryPage /></ProtectedRoute>} />
      <Route path="/brand/campaigns" element={<ProtectedRoute><CampaignManagementPage /></ProtectedRoute>} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
