
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content/ContentListPage';
import SocialConnect from '@/pages/SocialConnect';
import Messages from '@/pages/Messaging';
import Profile from '@/pages/CreatorProfile';
import BrandDeals from '@/pages/BrandDeals';
import NotificationsPage from '@/pages/NotificationsPage';
import Settings from '@/pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/content" element={<Content />} />
      <Route path="/social-connect" element={<SocialConnect />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/deals" element={<BrandDeals />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
