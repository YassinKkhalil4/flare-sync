
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import SidebarHeader from './sidebar/SidebarHeader';
import NavSection from './sidebar/NavSection';

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const { navigation, user, isLoading } = useNavigation();
  
  if (!user || isLoading) return null;
  
  return (
    <aside className={cn(
      "bg-card border-r flex flex-col h-screen transition-all duration-300", 
      collapsed ? "w-[64px]" : "w-[240px]"
    )}>
      <SidebarHeader />
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="px-2 py-4">
          {navigation.map((section, index) => (
            <React.Fragment key={index}>
              <NavSection section={section} />
              {index < navigation.length - 1 && section.title !== 'AI FEATURES' && (
                <div className="mt-2 mb-2">
                  <Separator />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AppSidebar;
