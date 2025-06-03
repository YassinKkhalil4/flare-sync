
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { NavItem as NavItemType } from '@/config/navigation';

interface NavItemProps {
  item: NavItemType;
  badge?: React.ReactNode;
}

const SubLink = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link to={to} className="block">
    <div
      className={cn(
        "text-xs py-1.5 px-3 mb-1 rounded-md transition-colors",
        active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground"
      )}
    >
      {label}
    </div>
  </Link>
);

const AIToolsSection = ({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) => {
  const { isActive } = useNavigation();
  
  const aiTools = [
    { to: '/content/caption-generator', label: 'Caption Generator' },
    { to: '/content/engagement-predictor', label: 'Engagement Predictor' },
    { to: '/content/content-plan', label: 'Content Plan Generator' },
    { to: '/content/smart-assistant', label: 'Smart Assistant' },
    { to: '/content/smart-scheduler', label: 'Smart Scheduler' },
    { to: '/content/brand-matchmaker', label: 'Brand Matchmaker' }
  ];

  return (
    <div className="mt-2">
      <div 
        className="flex items-center text-xs px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground"
        onClick={onToggle}
      >
        <span className="h-3.5 w-3.5 mr-1.5 text-primary">✨</span>
        <span>AI Tools</span>
        <ChevronRight className={cn("h-3.5 w-3.5 ml-auto transition-transform", expanded && "rotate-90")} />
      </div>
      
      {expanded && (
        <div className="mt-1">
          {aiTools.map((tool) => (
            <SubLink 
              key={tool.to}
              to={tool.to} 
              label={tool.label} 
              active={isActive(tool.to)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NavItem = ({ item, badge }: NavItemProps) => {
  const { collapsed } = useSidebar();
  const { isActive, isContentSection, isAIToolSection } = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [aiToolsExpanded, setAiToolsExpanded] = useState(false);

  const active = isActive(item.to) || (item.children && item.children.some(child => isActive(child.to)));

  useEffect(() => {
    if (isContentSection && !collapsed && item.label === 'Content') {
      setExpanded(true);
    }
    if (isAIToolSection && !collapsed) {
      setAiToolsExpanded(true);
      setExpanded(true);
    }
  }, [isContentSection, isAIToolSection, collapsed, item.label]);

  const handleClick = () => {
    if (item.children && !collapsed) {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <Link to={item.to} className="block" onClick={item.children ? handleClick : undefined}>
        <div
          className={cn(
            "flex items-center py-2.5 px-3 mb-1 rounded-lg transition-colors",
            active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
          )}
        >
          <div className="mr-2.5 text-current">
            <item.icon className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              {badge && badge}
            </div>
          )}
          {collapsed && badge && <div className="ml-auto">{badge}</div>}
        </div>
      </Link>
      
      {item.children && !collapsed && expanded && (
        <div className="ml-9 mt-1 mb-2">
          {item.children.map((child) => (
            <SubLink 
              key={child.to}
              to={child.to} 
              label={child.label} 
              active={isActive(child.to)} 
            />
          ))}
          
          {item.label === 'Content' && (
            <AIToolsSection 
              expanded={aiToolsExpanded} 
              onToggle={() => setAiToolsExpanded(!aiToolsExpanded)} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NavItem;
