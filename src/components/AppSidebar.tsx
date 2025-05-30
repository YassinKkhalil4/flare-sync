
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Calendar, 
  Inbox, 
  BarChart3,
  LineChart,
  Settings, 
  CircleDollarSign, 
  ImageIcon, 
  UsersRound, 
  Sparkles, 
  Zap, 
  Bot, 
  Clock, 
  Target,
  PieChart,
  Shield,
  CreditCard,
  FileText
} from 'lucide-react';
import AIFeaturesBadge from './AIFeaturesBadge';
import Logo from './Logo';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

const SidebarLink = ({ to, icon, label, active, onClick, children, badge }: SidebarLinkProps) => {
  const { collapsed } = useSidebar();
  
  return (
    <div>
      <Link to={to} className="block" onClick={onClick}>
        <div
          className={cn(
            "flex items-center py-2.5 px-3 mb-1 rounded-lg transition-colors",
            active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
          )}
        >
          <div className="mr-2.5 text-current">
            {icon}
          </div>
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              {badge && badge}
            </div>
          )}
          {collapsed && badge && <div className="ml-auto">{badge}</div>}
        </div>
      </Link>
      {children && !collapsed && <div className="ml-9 mt-1 mb-2">{children}</div>}
    </div>
  );
};

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

const AppSidebar = () => {
  const { user } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();
  const location = useLocation();
  const { userRole, isAdmin, isLoading } = useUserRole();
  const [contentExpanded, setContentExpanded] = useState(false);
  const [aiToolsExpanded, setAiToolsExpanded] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isContentSection = location.pathname.startsWith('/content');
  const isAIToolSection = location.pathname.includes('/content/') && 
    (location.pathname.includes('caption-generator') || 
     location.pathname.includes('engagement-predictor') || 
     location.pathname.includes('content-plan') || 
     location.pathname.includes('smart-assistant') ||
     location.pathname.includes('brand-matchmaker') ||
     location.pathname.includes('smart-scheduler'));
  
  useEffect(() => {
    if (isContentSection && !collapsed) {
      setContentExpanded(true);
    }
    if (isAIToolSection && !collapsed) {
      setAiToolsExpanded(true);
      setContentExpanded(true);
    }
  }, [isContentSection, isAIToolSection, collapsed]);
  
  if (!user || isLoading) return null;
  
  const isBrand = userRole === 'brand';
  const isCreator = userRole === 'creator';
  
  return (
    <aside className={cn(
      "bg-card border-r flex flex-col h-screen transition-all duration-300", 
      collapsed ? "w-[64px]" : "w-[240px]"
    )}>
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
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="px-2 py-4">
          <SidebarLink 
            to="/dashboard" 
            icon={<Home className="h-5 w-5" />} 
            label="Dashboard" 
            active={isActive('/dashboard')} 
          />

          <SidebarLink 
            to="/analytics" 
            icon={<PieChart className="h-5 w-5" />} 
            label="Analytics" 
            active={isActive('/analytics')} 
          />
          
          {/* Creator-specific navigation */}
          {isCreator && (
            <>
              <SidebarLink
                to="#"
                icon={<ImageIcon className="h-5 w-5" />}
                label="Content"
                active={isContentSection}
                onClick={() => !collapsed && setContentExpanded(!contentExpanded)}
              >
                {contentExpanded && (
                  <>
                    <SubLink to="/content" label="All Content" active={isActive('/content')} />
                    <SubLink to="/content/calendar" label="Calendar" active={isActive('/content/calendar')} />
                    <SubLink to="/content/create" label="Create New" active={isActive('/content/create')} />
                    <SubLink to="/content/approval" label="Approvals" active={isActive('/content/approval')} />
                    
                    {/* AI Tools Section */}
                    <div className="mt-2">
                      <div 
                        className="flex items-center text-xs px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        <span>AI Tools</span>
                        <ChevronRight className={cn("h-3.5 w-3.5 ml-auto transition-transform", aiToolsExpanded && "rotate-90")} />
                      </div>
                      
                      {aiToolsExpanded && (
                        <div className="mt-1">
                          <SubLink 
                            to="/content/caption-generator" 
                            label="Caption Generator" 
                            active={isActive('/content/caption-generator')} 
                          />
                          <SubLink 
                            to="/content/engagement-predictor" 
                            label="Engagement Predictor" 
                            active={isActive('/content/engagement-predictor')} 
                          />
                          <SubLink 
                            to="/content/content-plan" 
                            label="Content Plan Generator" 
                            active={isActive('/content/content-plan')} 
                          />
                          <SubLink 
                            to="/content/smart-assistant" 
                            label="Smart Assistant" 
                            active={isActive('/content/smart-assistant')} 
                          />
                          <SubLink 
                            to="/content/smart-scheduler" 
                            label="Smart Scheduler" 
                            active={isActive('/content/smart-scheduler')} 
                          />
                          <SubLink 
                            to="/content/brand-matchmaker" 
                            label="Brand Matchmaker" 
                            active={isActive('/content/brand-matchmaker')} 
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </SidebarLink>
              
              <SidebarLink 
                to="/social-connect" 
                icon={<Zap className="h-5 w-5" />} 
                label="Social Accounts" 
                active={isActive('/social-connect')} 
              />
            </>
          )}
          
          {/* Brand-specific navigation */}
          {isBrand && (
            <>
              <SidebarLink 
                to="/brand/discovery" 
                icon={<UsersRound className="h-5 w-5" />} 
                label="Find Creators" 
                active={isActive('/brand/discovery')} 
              />
              
              <SidebarLink 
                to="/brand/campaigns" 
                icon={<BarChart3 className="h-5 w-5" />} 
                label="Campaigns" 
                active={isActive('/brand/campaigns')} 
              />
            </>
          )}
          
          {/* Common navigation for all users */}
          <SidebarLink 
            to="/messaging" 
            icon={<Inbox className="h-5 w-5" />} 
            label="Messages" 
            active={isActive('/messaging')} 
          />
          
          <SidebarLink 
            to="/deals" 
            icon={<CircleDollarSign className="h-5 w-5" />} 
            label="Brand Deals" 
            active={isActive('/deals')} 
          />
          
          <div className="mt-2 mb-2">
            <Separator />
          </div>
          
          {/* AI Feature Standalone Links for Creators */}
          {isCreator && (
            <>
              <div className={cn("mb-2", collapsed ? "px-0" : "px-3")}>
                {!collapsed && <h4 className="text-xs font-medium mb-2 text-muted-foreground">AI FEATURES</h4>}
              </div>
              
              <SidebarLink 
                to="/content/caption-generator" 
                icon={<Sparkles className="h-5 w-5" />} 
                label="Caption Generator" 
                active={isActive('/content/caption-generator')}
                badge={!collapsed && <AIFeaturesBadge />}
              />
              
              <SidebarLink 
                to="/content/engagement-predictor" 
                icon={<LineChart className="h-5 w-5" />} 
                label="Engagement Predictor" 
                active={isActive('/content/engagement-predictor')} 
              />
              
              <SidebarLink 
                to="/content/smart-assistant" 
                icon={<Bot className="h-5 w-5" />} 
                label="Smart Assistant" 
                active={isActive('/content/smart-assistant')} 
              />
              
              <SidebarLink 
                to="/content/smart-scheduler" 
                icon={<Clock className="h-5 w-5" />} 
                label="Smart Scheduler" 
                active={isActive('/content/smart-scheduler')} 
              />

              <SidebarLink 
                to="/content/brand-matchmaker" 
                icon={<Target className="h-5 w-5" />} 
                label="Brand Matchmaker" 
                active={isActive('/content/brand-matchmaker')} 
              />
              
              <div className="mt-2 mb-2">
                <Separator />
              </div>
            </>
          )}
          
          {/* Admin navigation */}
          {isAdmin && (
            <>
              <SidebarLink 
                to="/admin" 
                icon={<Shield className="h-5 w-5" />} 
                label="Admin Dashboard" 
                active={isActive('/admin')} 
              />
              <div className="mt-2 mb-2">
                <Separator />
              </div>
            </>
          )}
          
          {/* Account & Settings */}
          <SidebarLink 
            to="/plans" 
            icon={<CreditCard className="h-5 w-5" />} 
            label="Plans & Billing" 
            active={isActive('/plans')} 
          />
          
          <SidebarLink 
            to="/payment-history" 
            icon={<FileText className="h-5 w-5" />} 
            label="Payment History" 
            active={isActive('/payment-history')} 
          />
          
          <SidebarLink 
            to="/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            active={isActive('/settings')} 
          />
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AppSidebar;
