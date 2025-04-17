
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  User, 
  Tag,
  Bell
} from 'lucide-react';
import Logo from './Logo';
import { NotificationIcon } from './NotificationIcon';

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const queryClient = useQueryClient();
  
  const handleLogout = async () => {
    // Clear cache
    queryClient.clear();
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <div className={`border-r bg-background h-screen flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="p-4 flex items-center justify-center">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          <NavItem icon={<LayoutDashboard />} to="/dashboard" label="Dashboard" collapsed={collapsed} />
          <NavItem icon={<FileText />} to="/content" label="Content" collapsed={collapsed} />
          <NavItem icon={<Users />} to="/social-connect" label="Social" collapsed={collapsed} />
          <NavItem icon={<MessageSquare />} to="/messages" label="Messages" collapsed={collapsed} />
          <NavItem icon={<Tag />} to="/deals" label="Deals" collapsed={collapsed} />
          <NavItem icon={<Bell />} to="/notifications" label="Notifications" collapsed={collapsed} />
        </ul>
      </nav>
      <div className="mt-auto px-2 py-4">
        <ul className="space-y-1">
          <NavItem icon={<User />} to="/profile" label="Profile" collapsed={collapsed} />
          <NavItem icon={<Settings />} to="/settings" label="Settings" collapsed={collapsed} />
          <li>
            <button
              onClick={handleLogout}
              className={`flex items-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-2 py-2 w-full transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="ml-3">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  to: string;
  label: string;
  collapsed: boolean;
}

function NavItem({ icon, to, label, collapsed }: NavItemProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `
          flex items-center text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-2 py-2 w-full transition-colors 
          ${isActive ? 'bg-accent text-accent-foreground' : ''} 
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <div className="h-5 w-5 shrink-0">{icon}</div>
        {!collapsed && <span className="ml-3">{label}</span>}
      </NavLink>
    </li>
  );
}
