
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
      <Route path="/content/calendar" element={<ProtectedRoute><MainLayout><ContentCalendarPage /></MainLayout></ProtectedRoute>} />
      
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
