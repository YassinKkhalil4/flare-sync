
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content/ContentListPage';
import SocialConnect from '@/pages/SocialConnect';
import Messages from '@/pages/Messaging';
import Profile from '@/pages/CreatorProfile';
import BrandDeals from '@/pages/BrandDeals';
import NotificationsPage from '@/pages/NotificationsPage';
import Settings from '@/pages/Settings';
import TermsOfUse from '@/pages/TermsOfUse';
import TermsAndConditions from '@/pages/TermsAndConditions';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import OnboardingWrapper from '@/components/layouts/OnboardingWrapper';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Landing page - this will be used for local development only 
           The actual landing is on flaresync.org */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      
      {/* Protected routes that require authentication */}
      <Route element={
        <ProtectedRoute>
          <OnboardingWrapper>
            <MainLayout />
          </OnboardingWrapper>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/content" element={<Content />} />
        <Route path="/social-connect" element={<SocialConnect />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/deals" element={<BrandDeals />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Route>
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
