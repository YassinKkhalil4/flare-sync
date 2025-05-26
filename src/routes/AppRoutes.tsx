import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { OnboardingWrapper } from '@/components/layouts/OnboardingWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import SocialConnect from '@/pages/SocialConnect';
import SocialConnectCallback from '@/components/social/SocialConnectCallback';
import Notifications from '@/pages/Notifications';
import Analytics from '@/pages/Analytics';
import Pricing from '@/pages/Pricing';
import Upgrade from '@/pages/Upgrade';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/OnboardingPage';
import Logout from '@/pages/Logout';
import Deals from '@/pages/Deals';
import ContentCalendar from '@/pages/ContentCalendar';
import Messaging from '@/pages/Messaging';
import SocialCallbackHandler from '@/components/social/SocialCallbackHandler';
import ApiKeysSetup from '@/pages/ApiKeysSetup';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><MainLayout><Home /></MainLayout></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/social-connect" element={<ProtectedRoute><MainLayout><OnboardingWrapper><SocialConnect /></OnboardingWrapper></MainLayout></ProtectedRoute>} />
      <Route path="/social-connect/callback" element={<SocialConnectCallback />} />
      <Route path="/social-callback" element={<SocialCallbackHandler />} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/upgrade" element={<ProtectedRoute><MainLayout><Upgrade /></MainLayout></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><MainLayout><OnboardingWrapper><OnboardingPage /></OnboardingWrapper></MainLayout></ProtectedRoute>} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/deals" element={<ProtectedRoute><MainLayout><Deals /></MainLayout></ProtectedRoute>} />
      <Route path="/content-calendar" element={<ProtectedRoute><MainLayout><ContentCalendar /></MainLayout></ProtectedRoute>} />
      <Route path="/messaging" element={<ProtectedRoute><MainLayout><Messaging /></MainLayout></ProtectedRoute>} />
      
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
