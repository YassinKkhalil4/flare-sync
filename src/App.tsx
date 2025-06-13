
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Content from '@/pages/Content';
import ContentCreatePage from '@/pages/Content/ContentCreatePage';
import { ContentEditPage } from '@/pages/Content/ContentEditPage';
import SocialConnect from '@/pages/SocialConnect';
import AnalyticsDashboard from '@/pages/Analytics/AnalyticsDashboard';
import Settings from '@/pages/Settings';
import Plans from '@/pages/Plans';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import { CaptionGenerator } from '@/pages/Content/CaptionGeneratorPage';
import { EngagementPredictor } from '@/pages/Content/EngagementPredictorPage';
import { ScheduledPosts } from '@/components/content/ScheduledPosts';
import { ContentCalendar } from '@/pages/Content/ContentCalendarPage';
import PostDetail from '@/components/content/PostDetail';
import { MediaManager } from '@/components/media/MediaManager';
import { PostEditor } from '@/components/content/PostEditor';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/social-connect" element={<SocialConnect />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/caption-generator" element={<CaptionGenerator />} />
            <Route path="/engagement-predictor" element={<EngagementPredictor />} />
            <Route path="/content/calendar" element={<ContentCalendar />} />
            <Route path="/content/scheduled" element={<ScheduledPosts />} />
            <Route path="/content/detail/:id" element={<PostDetail />} />
            
            {/* Content Management Routes */}
            <Route path="/content" element={<Content />} />
            <Route path="/content/create" element={<ContentCreatePage />} />
            <Route path="/content/edit/:id" element={<PostEditor />} />
            <Route path="/media-manager" element={<MediaManager />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
