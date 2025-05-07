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
  SparkleIcon
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface SidebarItem {
  href: string;
  icon: any;
  label: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Close the sidebar when the route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const sidebarItems: SidebarItem[] = [
    { href: "/dashboard", icon: BarChart, label: "Dashboard" },
    { href: "/social-connect", icon: Users, label: "Social Connect" },
    { href: "/content", icon: Image, label: "Content" },
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
        <div className="flex flex-col space-y-1 px-2 mt-4">
          {sidebarItems.map((item) => (
            <SidebarItemLink key={item.href} href={item.href} icon={item.icon} label={item.label} onClick={() => setIsMenuOpen(false)} />
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
      <div className="flex flex-col space-y-1 px-2 mt-4">
        {sidebarItems.map((item) => (
          <SidebarItemLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
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
};

interface SidebarItemLinkProps {
  href: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const SidebarItemLink = ({ href, icon: Icon, label, onClick }: SidebarItemLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

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
