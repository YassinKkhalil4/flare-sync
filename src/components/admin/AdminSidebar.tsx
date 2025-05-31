
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  Activity,
  Database,
  BarChart3,
  LogOut,
  Home,
  Bell,
  Key
} from 'lucide-react';
import Logo from '../Logo';

interface AdminSidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const AdminSidebarLink = ({ to, icon, label, active }: AdminSidebarLinkProps) => {
  return (
    <Link to={to} className="block">
      <div
        className={cn(
          "flex items-center py-3 px-4 mb-1 rounded-lg transition-colors",
          active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="mr-3 text-current">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const AdminSidebar = () => {
  const { user, signOut } = useAuth();
  const { adminTier } = useUserRole();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <aside className="bg-card border-r flex flex-col h-screen w-[280px]">
      <div className="flex items-center px-6 py-4 h-[70px] border-b">
        <Logo size="medium" />
        <div className="ml-3">
          <h1 className="text-xl font-bold">FlareSync Admin</h1>
          <p className="text-xs text-muted-foreground">Administrator Dashboard</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-4 py-6">
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Overview
            </h4>
            <AdminSidebarLink 
              to="/admin" 
              icon={<Home className="h-5 w-5" />} 
              label="Dashboard" 
              active={isActive('/admin')} 
            />
            <AdminSidebarLink 
              to="/admin/analytics" 
              icon={<BarChart3 className="h-5 w-5" />} 
              label="Platform Analytics" 
              active={isActive('/admin/analytics')} 
            />
            <AdminSidebarLink 
              to="/admin/activity" 
              icon={<Activity className="h-5 w-5" />} 
              label="System Activity" 
              active={isActive('/admin/activity')} 
            />
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Management
            </h4>
            <AdminSidebarLink 
              to="/admin/users" 
              icon={<Users className="h-5 w-5" />} 
              label="User Management" 
              active={isActive('/admin/users')} 
            />
            <AdminSidebarLink 
              to="/admin/content" 
              icon={<FileText className="h-5 w-5" />} 
              label="Content Moderation" 
              active={isActive('/admin/content')} 
            />
            <AdminSidebarLink 
              to="/admin/billing" 
              icon={<CreditCard className="h-5 w-5" />} 
              label="Billing & Revenue" 
              active={isActive('/admin/billing')} 
            />
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              System
            </h4>
            <AdminSidebarLink 
              to="/admin/notifications" 
              icon={<Bell className="h-5 w-5" />} 
              label="Notifications" 
              active={isActive('/admin/notifications')} 
            />
            <AdminSidebarLink 
              to="/admin/api-keys" 
              icon={<Key className="h-5 w-5" />} 
              label="API Configuration" 
              active={isActive('/admin/api-keys')} 
            />
            <AdminSidebarLink 
              to="/admin/database" 
              icon={<Database className="h-5 w-5" />} 
              label="Database Management" 
              active={isActive('/admin/database')} 
            />
            <AdminSidebarLink 
              to="/admin/settings" 
              icon={<Settings className="h-5 w-5" />} 
              label="Platform Settings" 
              active={isActive('/admin/settings')} 
            />
          </div>

          <Separator className="my-4" />
          
          <div className="mb-4">
            <div className="flex items-center px-4 py-2 bg-muted rounded-lg">
              <Shield className="h-4 w-4 text-primary mr-2" />
              <div className="flex-1">
                <p className="text-xs font-medium">Admin Level</p>
                <p className="text-xs text-muted-foreground capitalize">{adminTier || 'Standard'}</p>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={signOut}
            className="w-full flex items-center justify-start gap-2 text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default AdminSidebar;
