
import { Routes, Route } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
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
    </Routes>
  );
};

export default AppRoutes;
