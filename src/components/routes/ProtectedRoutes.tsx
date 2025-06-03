
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import ContentEditPage from '@/pages/Content/ContentEditPage';
import ContentDetailPage from '@/pages/Content/ContentDetailPage';
import ContentListPage from '@/pages/Content/ContentListPage';
import SmartPostSchedulerPage from '@/pages/Content/SmartPostSchedulerPage';
import SocialAccounts from '@/pages/SocialAccounts';
import Messaging from '@/pages/Messaging';
import Profile from '@/pages/Profile';
import BrandDeals from '@/pages/BrandDeals';
import Settings from '@/pages/Settings';
import Plans from '@/pages/Plans';
import CaptionGenerator from '@/pages/CaptionGenerator';
import EngagementPredictor from '@/pages/EngagementPredictor';
import BrandMatchmaker from '@/pages/BrandMatchmaker';

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
      <Route path="/content/create" element={<ProtectedRoute><ContentCreatePage /></ProtectedRoute>} />
      <Route path="/content/edit/:id" element={<ProtectedRoute><ContentEditPage /></ProtectedRoute>} />
      <Route path="/content/detail/:id" element={<ProtectedRoute><ContentDetailPage /></ProtectedRoute>} />
      <Route path="/content/list" element={<ProtectedRoute><ContentListPage /></ProtectedRoute>} />
      <Route path="/content/scheduler" element={<ProtectedRoute><SmartPostSchedulerPage /></ProtectedRoute>} />
      <Route path="/social" element={<ProtectedRoute><SocialAccounts /></ProtectedRoute>} />
      <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/brand-deals" element={<ProtectedRoute><BrandDeals /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/caption-generator" element={<ProtectedRoute><CaptionGenerator /></ProtectedRoute>} />
      <Route path="/engagement-predictor" element={<ProtectedRoute><EngagementPredictor /></ProtectedRoute>} />
      <Route path="/brand-matchmaker" element={<ProtectedRoute><BrandMatchmaker /></ProtectedRoute>} />
    </Routes>
  );
};

export default ProtectedRoutes;
