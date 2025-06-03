
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/layouts/MainLayout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentEditPage from '@/pages/Content/ContentEditPage';
import ContentDetailPage from '@/pages/Content/ContentDetailPage';
import ContentListPage from '@/pages/Content/ContentListPage';
import ContentCalendarPage from '@/pages/Content/ContentCalendarPage';
import ContentApprovalPage from '@/pages/Content/ContentApprovalPage';
import SmartSchedulerPage from '@/pages/Content/SmartSchedulerPage';
import CaptionGeneratorPage from '@/pages/Content/CaptionGeneratorPage';
import BrandMatchmakerPage from '@/pages/Content/BrandMatchmakerPage';
import EngagementPredictorPage from '@/pages/Content/EngagementPredictorPage';
import ContentPlanGeneratorPage from '@/pages/Content/ContentPlanGeneratorPage';
import SmartAssistantPage from '@/pages/Content/SmartAssistantPage';
import SocialConnect from '@/pages/SocialConnect';
import Analytics from '@/pages/Analytics';
import BrandDeals from '@/pages/BrandDeals';
import CreatorProfile from '@/pages/CreatorProfile';
import Messaging from '@/pages/Messaging';
import Plans from '@/pages/Plans';
import PaymentHistory from '@/pages/PaymentHistory';
import Settings from '@/pages/Settings';
import NotificationsPage from '@/pages/NotificationsPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminBilling from '@/pages/admin/AdminBilling';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import CreatorDiscoveryPage from '@/pages/Brand/CreatorDiscoveryPage';
import CampaignManagementPage from '@/pages/Brand/CampaignManagementPage';
import NotFound from '@/pages/NotFound';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Content Management Routes */}
        <Route path="/content" element={<Content />} />
        <Route path="/content/create" element={<ContentCreatePage />} />
        <Route path="/content/edit/:id" element={<ContentEditPage />} />
        <Route path="/content/:id" element={<ContentDetailPage />} />
        <Route path="/content/list" element={<ContentListPage />} />
        <Route path="/content/calendar" element={<ContentCalendarPage />} />
        <Route path="/content/approval" element={<ContentApprovalPage />} />
        <Route path="/content/scheduler" element={<SmartSchedulerPage />} />
        <Route path="/content/caption-generator" element={<CaptionGeneratorPage />} />
        <Route path="/content/brand-matchmaker" element={<BrandMatchmakerPage />} />
        <Route path="/content/engagement-predictor" element={<EngagementPredictorPage />} />
        <Route path="/content/plan-generator" element={<ContentPlanGeneratorPage />} />
        <Route path="/content/smart-assistant" element={<SmartAssistantPage />} />
        
        <Route path="/social-connect" element={<SocialConnect />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/brand-deals" element={<BrandDeals />} />
        <Route path="/profile" element={<CreatorProfile />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Brand Routes */}
        <Route path="/brand/discovery" element={<CreatorDiscoveryPage />} />
        <Route path="/brand/campaigns" element={<CampaignManagementPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/billing" element={<AdminBilling />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
