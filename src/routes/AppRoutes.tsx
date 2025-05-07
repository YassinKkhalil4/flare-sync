
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SocialConnect from "@/pages/SocialConnect";
import ContentListPage from "@/pages/Content/ContentListPage";
import ContentDetailPage from "@/pages/Content/ContentDetailPage";
import ContentCreatePage from "@/pages/Content/ContentCreatePage";
import ContentEditPage from "@/pages/Content/ContentEditPage";
import ContentApprovalPage from "@/pages/Content/ContentApprovalPage";
import CaptionGeneratorPage from "@/pages/Content/CaptionGeneratorPage";
import EngagementPredictorPage from "@/pages/Content/EngagementPredictorPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import PaymentHistory from "@/pages/PaymentHistory";
import Plans from "@/pages/Plans";
import Settings from "@/pages/Settings";
import TermsOfUse from "@/pages/TermsOfUse";
import MainLayout from "@/components/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingWrapper from "@/components/layouts/OnboardingWrapper";
import Landing from "@/pages/Landing";
import CreatorProfile from "@/pages/CreatorProfile";
import BrandDeals from "@/pages/BrandDeals";
import Messaging from "@/pages/Messaging";
import NotificationsPage from "@/pages/NotificationsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

// Import index page as default fallback
import Index from "@/pages/Index";

const AppRoutes = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showOnboarding, isChecking } = useOnboarding();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (!isAuthLoading && !isChecking) {
      setIsReady(true);
    }
  }, [isAuthLoading, isChecking]);
  
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/landing" element={<Landing />} />
      
      {/* Protected routes wrapped in MainLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <OnboardingWrapper>
            <MainLayout />
          </OnboardingWrapper>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="social-connect" element={<SocialConnect />} />
        <Route path="content" element={<ContentListPage />} />
        <Route path="content/create" element={<ContentCreatePage />} />
        <Route path="content/edit/:id" element={<ContentEditPage />} />
        <Route path="content/detail/:id" element={<ContentDetailPage />} />
        <Route path="content/approval" element={<ContentApprovalPage />} />
        <Route path="content/captions" element={<CaptionGeneratorPage />} />
        <Route path="content/engagement" element={<EngagementPredictorPage />} />
        <Route path="profile" element={<CreatorProfile />} />
        <Route path="deals" element={<BrandDeals />} />
        <Route path="messaging" element={<Messaging />} />
        <Route path="messaging/:id" element={<Messaging />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="payment-history" element={<PaymentHistory />} />
        <Route path="plans" element={<Plans />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
