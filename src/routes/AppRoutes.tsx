
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import OnboardingWrapper from '@/components/layouts/OnboardingWrapper';
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
const CreatorProfile = React.lazy(() => import('@/pages/CreatorProfile'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const SocialConnect = React.lazy(() => import('@/pages/SocialConnect'));

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
          
          {/* Protected routes with regular layout */}
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
            path="/profile"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <CreatorProfile />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <Analytics />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <Settings />
                </OnboardingWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/social-accounts"
            element={
              <ProtectedRoute>
                <OnboardingWrapper>
                  <SocialConnect />
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
          
          {/* Admin routes - separate from regular layout */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
