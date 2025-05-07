
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  collapsed?: boolean;
}

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 lg:hidden"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
