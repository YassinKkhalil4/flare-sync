
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SocialConnectModal from '@/components/social/SocialConnectModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Social Connect Modal for new users */}
        <SocialConnectModal />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
