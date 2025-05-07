
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart, 
  Calendar, 
  Image, 
  MessageSquare, 
  Settings, 
  Users,
  Bell,
  CreditCard,
  Tag,
  BookOpen,
  SparkleIcon,
  MessageCircle,
  Brain,
  Clock
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface SidebarItem {
  href: string;
  icon: any;
  label: string;
  subItems?: SidebarItem[];
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    // Close the sidebar when the route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubmenu = (href: string) => {
    if (openSubmenu === href) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(href);
    }
  };

  // Check if a route is active including nested routes
  const isRouteActive = (href: string) => {
    return location.pathname === href || 
           (href !== "/" && location.pathname.startsWith(href));
  };

  const sidebarItems: SidebarItem[] = [
    { href: "/dashboard", icon: BarChart, label: "Dashboard" },
    { href: "/social-connect", icon: Users, label: "Social Connect" },
    { 
      href: "/content", 
      icon: Image, 
      label: "Content",
      subItems: [
        { href: "/content", icon: Image, label: "Content List" },
        { href: "/content/create", icon: SparkleIcon, label: "Create Content" },
        { href: "/content/captions", icon: MessageSquare, label: "Caption Generator" },
        { href: "/content/engagement", icon: BarChart, label: "Engagement Predictor" },
        { href: "/content/brand-matchmaker", icon: Brain, label: "Brand Matchmaker" },
        { href: "/content/plan-generator", icon: Calendar, label: "Content Planner" },
        { href: "/content/smart-assistant", icon: MessageCircle, label: "Smart Assistant" },
        { href: "/content/smart-scheduler", icon: Clock, label: "Post Scheduler" }
      ]
    },
    { href: "/deals", icon: Tag, label: "Brand Deals" },
    { href: "/messaging", icon: MessageSquare, label: "Messaging" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/payment-history", icon: CreditCard, label: "Payment History" },
    { href: "/plans", icon: BookOpen, label: "Plans" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  if (isMobile) {
    return (
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-secondary border-r border-r-muted flex-col py-4", className, isMenuOpen ? "block" : "hidden")}>
        <div className="px-6">
          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
            <div className="mb-4 flex items-center">
              <Logo />
            </div>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto lg:hidden" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </Button>
        </div>
        <Separator className="border-primary/40" />
        <div className="flex flex-col space-y-1 px-2 mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {sidebarItems.map((item) => (
            item.subItems ? (
              <Collapsible 
                key={item.href}
                open={isRouteActive(item.href)}
                onOpenChange={() => toggleSubmenu(item.href)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-between font-normal",
                      isRouteActive(item.href) ? "bg-secondary/10" : "hover:bg-secondary/10"
                    )}
                  >
                    <span className="flex items-center">
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.label}</span>
                    </span>
                    {openSubmenu === item.href ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1">
                  {item.subItems.map((subItem) => (
                    <SidebarItemLink 
                      key={subItem.href} 
                      href={subItem.href} 
                      icon={subItem.icon} 
                      label={subItem.label} 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarItemLink 
                key={item.href} 
                href={item.href} 
                icon={item.icon} 
                label={item.label} 
                onClick={() => setIsMenuOpen(false)} 
              />
            )
          ))}
        </div>
        <Separator className="border-primary/40" />
        <div className="mt-auto px-6">
          <Button variant="ghost" className="w-full py-2" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-secondary border-r border-r-muted flex-col py-4", className)}>
      <div className="px-6">
        <Link to="/dashboard">
          <div className="mb-4 flex items-center">
            <Logo />
          </div>
        </Link>
      </div>
      <Separator className="border-primary/40" />
      <div className="flex flex-col space-y-1 px-2 mt-4 overflow-y-auto">
        {sidebarItems.map((item) => (
          item.subItems ? (
            <Collapsible 
              key={item.href}
              open={isRouteActive(item.href)}
              onOpenChange={() => toggleSubmenu(item.href)}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-between font-normal",
                    isRouteActive(item.href) ? "bg-secondary/10" : "hover:bg-secondary/10"
                  )}
                >
                  <span className="flex items-center">
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </span>
                  {openSubmenu === item.href ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1">
                {item.subItems.map((subItem) => (
                  <SidebarItemLink 
                    key={subItem.href} 
                    href={subItem.href} 
                    icon={subItem.icon} 
                    label={subItem.label} 
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarItemLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          )
        ))}
      </div>
      <Separator className="border-primary/40 mt-auto" />
      <div className="mt-4 px-6">
        <Button variant="ghost" className="w-full py-2" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

interface SidebarItemLinkProps {
  href: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const SidebarItemLink = ({ href, icon: Icon, label, onClick }: SidebarItemLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || 
                  (href !== "/" && location.pathname.startsWith(href + "/"));

  return (
    <Link to={href} onClick={onClick}>
      <Button variant="ghost" className={cn("w-full justify-start font-normal", isActive ? "bg-secondary/10" : "hover:bg-secondary/10")}>
        <Icon className="h-4 w-4 mr-2" />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export default Sidebar;
