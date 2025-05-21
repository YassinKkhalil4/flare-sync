import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  Users,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Link2,
  Calendar,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from './Logo';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  title: string;
  path?: string;
  icon?: any;
  items?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderIcon = (icon: any) => {
    return <>{icon && React.createElement(icon, { className: "h-4 w-4" })}</>;
  };

  const renderItems = () => {
    const items: NavItem[] = [
      {
        title: 'Getting Started',
        icon: Home,
        path: '/getting-started',
      },
    ];

    // Add sidebar items based on role
    if (user) {
      if (user.role === 'creator') {
        items.push(
          {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
          },
          {
            title: 'Content Manager',
            icon: FileText,
            items: [
              { title: 'All Content', path: '/content' },
              { title: 'Create New', path: '/content/create' },
              { title: 'Caption Generator', path: '/content/caption-generator' },
              { title: 'Engagement Predictor', path: '/content/engagement-predictor' },
              { title: 'Brand Matchmaker', path: '/content/brand-matchmaker' },
              { title: 'Content Plan Generator', path: '/content/content-plan' },
              { title: 'Smart Assistant', path: '/content/smart-assistant' },
              { title: 'Smart Scheduler', path: '/content/smart-scheduler' },
            ],
          },
          {
            title: 'Social Profiles',
            icon: TrendingUp,
            path: '/social-profiles',
          },
          {
            title: 'Messaging',
            icon: MessageSquare,
            path: '/messaging',
          },
          {
            title: 'Deals & Collabs',
            icon: Link2,
            path: '/deals',
          },
          {
            title: 'Scheduler',
            icon: Calendar,
            path: '/scheduler',
          },
        );
      } else if (user.role === 'brand') {
        items.push(
          {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
          },
          {
            title: 'Find Creators',
            icon: Users,
            path: '/creators',
          },
          {
            title: 'Manage Campaigns',
            icon: CreditCard,
            path: '/campaigns',
          },
        );
      } else if (user.role === 'admin') {
        items.push(
          {
            title: 'Admin Dashboard',
            icon: LayoutDashboard,
            path: '/admin/dashboard',
          },
          {
            title: 'User Management',
            icon: Users,
            path: '/admin/users',
          },
          {
            title: 'Content Management',
            icon: FileText,
            path: '/admin/content',
          },
        );
      }
    }

    return items;
  };

  const navigateTo = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  const handleSignOut = async () => {
    // Since AuthContext doesn't have signOut, we'll just redirect to login for now
    // or we could implement a logout function here
    localStorage.removeItem('user');
    navigate('/login');
    closeMobileMenu();
  };

  const items = renderItems();

  return (
    <>
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-64">
          <SheetHeader className="text-left">
            <div className="flex items-center">
              <Logo size="medium" />
              <SheetTitle className="ml-2">FlareSync</SheetTitle>
            </div>
            <SheetDescription>
              Navigate through the application.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="my-4">
            <div className="py-4">
              {items.map((item, index) =>
                item.items ? (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium px-2">{item.title}</div>
                    {item.items.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start pl-9",
                          location.pathname === subItem.path ? "font-semibold" : "font-normal"
                        )}
                        onClick={() => navigateTo(subItem.path || '')}
                      >
                        {subItem.title}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.path ? "font-semibold" : "font-normal"
                    )}
                    onClick={() => navigateTo(item.path || '')}
                  >
                    {renderIcon(item.icon)}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                )
              )}
            </div>
          </ScrollArea>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0">
        <div
          className={cn(
            "flex flex-col h-full bg-secondary border-r border-secondary-foreground/10 text-secondary-foreground",
            collapsed ? "w-16" : "w-60",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div className="flex items-center justify-between px-2 py-3">
            <Link to="/" className="flex items-center">
              <Logo size={collapsed ? "small" : "medium"} />
              {!collapsed && <span className="text-2xl font-bold ml-2">FlareSync</span>}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              <span className="sr-only">Collapse</span>
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-4">
              {items.map((item, index) =>
                item.items ? (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium px-2">{item.title}</div>
                    {item.items.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start pl-9",
                          location.pathname === subItem.path ? "font-semibold" : "font-normal"
                        )}
                        onClick={() => navigateTo(subItem.path || '')}
                      >
                        {subItem.title}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === item.path ? "font-semibold" : "font-normal"
                    )}
                    onClick={() => navigateTo(item.path || '')}
                  >
                    {renderIcon(item.icon)}
                    {!collapsed && <span className="ml-2">{item.title}</span>}
                  </Button>
                )
              )}
            </div>
          </ScrollArea>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
