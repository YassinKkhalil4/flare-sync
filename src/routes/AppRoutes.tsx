
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import AdminLogin from '@/pages/AdminLogin';
import Signup from '@/pages/Signup';
import NotFoundPage from '@/pages/NotFound';
import ContentListPage from '@/pages/Content/ContentListPage';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentEditPage from '@/pages/Content/ContentEditPage';
import BrandDeals from '@/pages/BrandDeals';
import AdminDashboard from '@/pages/AdminDashboard';
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
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute children={undefined} />}>
        <Route element={<MainLayout />}>
          {/* Dashboard and account related routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Content Manager routes */}
          <Route path="/content" element={<ContentListPage />} />
          <Route path="/content/create" element={<ContentCreatePage />} />
          <Route path="/content/edit/:id" element={<ContentEditPage />} />

          {/* Deals routes */}
          <Route path="/deals" element={<BrandDeals />} />

          {/* AI features */}
          <Route path="/content/caption-generator" element={<CaptionGeneratorPage />} />
          <Route path="/content/engagement-predictor" element={<EngagementPredictorPage />} />
          <Route path="/content/brand-matchmaker" element={<BrandMatchmakerPage />} />
          <Route path="/content/content-plan" element={<ContentPlanGeneratorPage />} />
          <Route path="/content/smart-assistant" element={<SmartAssistantPage />} />
          <Route path="/content/smart-scheduler" element={<SmartPostSchedulerPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
