
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../Logo';

const SidebarHeader = () => {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <div className="flex items-center px-4 py-3 h-[60px]">
      {!collapsed ? (
        <>
          <Logo size="medium" />
          <h1 className="text-xl font-bold ml-2">FlareSync</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-8 w-8" 
            onClick={toggleCollapsed}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Logo size="small" className="mx-auto" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 h-8 w-8" 
            onClick={toggleCollapsed}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default SidebarHeader;
