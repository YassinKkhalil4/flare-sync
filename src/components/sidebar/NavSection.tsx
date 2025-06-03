
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { NavSection as NavSectionType } from '@/config/navigation';
import NavItem from './NavItem';
import AIFeaturesBadge from '../AIFeaturesBadge';

interface NavSectionProps {
  section: NavSectionType;
}

const NavSection = ({ section }: NavSectionProps) => {
  const { collapsed } = useSidebar();

  return (
    <div className="mb-4">
      {section.title && (
        <div className={cn("mb-2", collapsed ? "px-0" : "px-3")}>
          {!collapsed && (
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">
              {section.title}
            </h4>
          )}
        </div>
      )}
      
      {section.items.map((item) => (
        <NavItem 
          key={item.to} 
          item={item} 
          badge={item.label === 'Caption Generator' && !collapsed ? <AIFeaturesBadge /> : undefined}
        />
      ))}
    </div>
  );
};

export default NavSection;
