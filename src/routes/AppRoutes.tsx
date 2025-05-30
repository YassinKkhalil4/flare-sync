
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import OnboardingWrapper from '@/components/layouts/OnboardingWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Settings from '@/pages/Settings';
import SocialConnect from '@/pages/SocialConnect';
import SocialConnectCallback from '@/components/social/SocialConnectCallback';
import NotificationsPage from '@/pages/NotificationsPage';
import Analytics from '@/pages/Analytics';
import Plans from '@/pages/Plans';
import NotFound from '@/pages/NotFound';
import Messaging from '@/pages/Messaging';
import SocialCallbackHandler from '@/components/social/SocialCallbackHandler';
import ApiKeysSetup from '@/pages/ApiKeysSetup';
import BrandDeals from '@/pages/BrandDeals';
import ContentCalendarPage from '@/pages/Content/ContentCalendarPage';
import ContentPage from '@/pages/Content/ContentPage';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentApprovalPage from '@/pages/Content/ContentApprovalPage';
import CaptionGeneratorPage from '@/pages/Content/CaptionGeneratorPage';
import EngagementPredictorPage from '@/pages/Content/EngagementPredictorPage';
import BrandMatchmakerPage from '@/pages/Content/BrandMatchmakerPage';
import ContentPlanGeneratorPage from '@/pages/Content/ContentPlanGeneratorPage';
import SmartAssistantPage from '@/pages/Content/SmartAssistantPage';
import SmartSchedulerPage from '@/pages/Content/SmartSchedulerPage';
import CreatorDiscoveryPage from '@/pages/Brand/CreatorDiscoveryPage';
import CampaignManagementPage from '@/pages/Brand/CampaignManagementPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/social-connect" element={<ProtectedRoute><MainLayout><OnboardingWrapper><SocialConnect /></OnboardingWrapper></MainLayout></ProtectedRoute>} />
      <Route path="/social-connect/callback" element={<SocialConnectCallback />} />
      <Route path="/social-callback" element={<SocialCallbackHandler />} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/messaging" element={<ProtectedRoute><MainLayout><Messaging /></MainLayout></ProtectedRoute>} />
      <Route path="/deals" element={<ProtectedRoute><MainLayout><BrandDeals /></MainLayout></ProtectedRoute>} />
      
      {/* Content Management Routes */}
      <Route path="/content" element={<ProtectedRoute requireRole="creator"><MainLayout><ContentPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/create" element={<ProtectedRoute requireRole="creator"><MainLayout><ContentCreatePage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/calendar" element={<ProtectedRoute requireRole="creator"><MainLayout><ContentCalendarPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/approval" element={<ProtectedRoute requireRole="creator"><MainLayout><ContentApprovalPage /></MainLayout></ProtectedRoute>} />
      
      {/* AI Tools Routes */}
      <Route path="/content/caption-generator" element={<ProtectedRoute><MainLayout><CaptionGeneratorPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/engagement-predictor" element={<ProtectedRoute><MainLayout><EngagementPredictorPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/brand-matchmaker" element={<ProtectedRoute requireRole="creator"><MainLayout><BrandMatchmakerPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/content-plan" element={<ProtectedRoute><MainLayout><ContentPlanGeneratorPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/smart-assistant" element={<ProtectedRoute><MainLayout><SmartAssistantPage /></MainLayout></ProtectedRoute>} />
      <Route path="/content/smart-scheduler" element={<ProtectedRoute><MainLayout><SmartSchedulerPage /></MainLayout></ProtectedRoute>} />
      
      {/* Brand User Routes */}
      <Route path="/creators" element={<ProtectedRoute requireRole="brand"><MainLayout><CreatorDiscoveryPage /></MainLayout></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute requireRole="brand"><MainLayout><CampaignManagementPage /></MainLayout></ProtectedRoute>} />
      
      <Route 
        path="/api-keys-setup" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <OnboardingWrapper>
                <ApiKeysSetup />
              </OnboardingWrapper>
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
