
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Handshake
} from 'lucide-react';
import Logo from './Logo';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Content Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Creator Profile', path: '/profile', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Brand Deals', path: '/deals', icon: Handshake },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-card border-r border-border transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-[250px]'} z-30`}>
      <div className="h-full flex flex-col">
        <div className={`p-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
              <Logo />
            </div>
          ) : (
            <Logo />
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return collapsed ? (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
                      <Button 
                        variant={isActive ? "secondary" : "ghost"}
                        size="icon"
                        className="w-full h-10 mb-1"
                      >
                        <item.icon size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link to={item.path} key={item.path}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Log out
              </TooltipContent>
            </Tooltip>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                  {user?.avatar && (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-1/2 -right-3 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '>' : '<'}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
