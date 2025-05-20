
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SocialConnectModal from '@/components/social/SocialConnectModal';

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Social Connect Modal for new users */}
        <SocialConnectModal />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
