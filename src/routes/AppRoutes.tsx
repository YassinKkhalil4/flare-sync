import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ContentListPage from '@/pages/Content/ContentListPage';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentEditPage from '@/pages/Content/ContentEditPage';
import DealsDashboardPage from '@/pages/Deals/DealsDashboardPage';
import DealDetailsPage from '@/pages/Deals/DealDetailsPage';
import AdminDashboardPage from '@/pages/Admin/AdminDashboardPage';
import UserManagementPage from '@/pages/Admin/UserManagementPage';
import CaptionGeneratorPage from '@/pages/Content/CaptionGeneratorPage';
import EngagementPredictorPage from '@/pages/Content/EngagementPredictorPage';
import BrandMatchmakerPage from '@/pages/Content/BrandMatchmakerPage';
import ContentPlanGeneratorPage from '@/pages/Content/ContentPlanGeneratorPage';
import SmartAssistantPage from '@/pages/Content/SmartAssistantPage';
import SmartPostSchedulerPage from '@/pages/Content/SmartPostSchedulerPage';

const AppRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard and account related routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />

          {/* Content Manager routes */}
          <Route path="/content" element={<ContentListPage />} />
          <Route path="/content/create" element={<ContentCreatePage />} />
          <Route path="/content/edit/:id" element={<ContentEditPage />} />

          {/* Deals routes */}
          <Route path="/deals" element={<DealsDashboardPage />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />

          {/* AI features */}
          <Route path="/content/caption-generator" element={<CaptionGeneratorPage />} />
          <Route path="/content/engagement-predictor" element={<EngagementPredictorPage />} />
          <Route path="/content/brand-matchmaker" element={<BrandMatchmakerPage />} />
          <Route path="/content/content-plan" element={<ContentPlanGeneratorPage />} />
          <Route path="/content/smart-assistant" element={<SmartAssistantPage />} />
          <Route path="/content/smart-scheduler" element={<SmartPostSchedulerPage />} />

          {/* Admin routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
            </>
          )}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
