
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SocialConnectModal from '@/components/social/SocialConnectModal';
import Logo from '../Logo';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Note: This component is now deprecated since we're applying the sidebar at the App level
// It remains here for backward compatibility with existing pages
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center">
        <Logo size="large" />
        <h1 className="text-2xl font-bold ml-2">FlareSync</h1>
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
