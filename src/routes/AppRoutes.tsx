import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { OnboardingWrapper } from '@/components/layouts/OnboardingWrapper';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import PageLoading from '@/components/ui/page-loading';

// Lazy load components for better performance
const Index = React.lazy(() => import('@/pages/Index'));
const Landing = React.lazy(() => import('@/pages/Landing'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const AdminLogin = React.lazy(() => import('@/pages/AdminLogin'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const ApiKeysSetup = React.lazy(() => import('@/pages/ApiKeysSetup'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const ContentCalendar = React.lazy(() => import('@/pages/ContentCalendar'));
const AnalyticsDashboard = React.lazy(() => import('@/pages/AnalyticsDashboard'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const SocialAccounts = React.lazy(() => import('@/pages/SocialAccounts'));
const CaptionGenerator = React.lazy(() => import('@/pages/CaptionGenerator'));

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading text="Loading application..." />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <Dashboard />
                </OnboardingWrapper>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <ProfilePage />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <ContentCalendar />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <AnalyticsDashboard />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <SettingsPage />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/social-accounts"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <SocialAccounts />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/caption-generator"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <CaptionGenerator />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/api-keys-setup"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <ApiKeysSetup />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
