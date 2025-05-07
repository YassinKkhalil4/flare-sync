import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

import {
  Calendar,
  LucideIcon,
  Settings,
  Home,
  Instagram,
  FileText,
  MessageSquare,
  CreditCard,
  User,
  HandshakeIcon,
  Bell,
  Users,
  PenSquare,
  BarChart2
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavSectionProps {
  items: NavItem[];
  title?: string;
}

interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  icon: LucideIcon;
}

function NavLink({ to, children, icon, ...props }: NavLinkProps) {
  const { pathname } = useLocation();
  return (
    <Link to={to} className={cn(
      "group flex w-full items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-accent-foreground [&.active]:bg-secondary [&.active]:text-accent-foreground",
      pathname === to ? "active" : "",
    )} {...props}>
      <icon className="mr-2 h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

function NavSection({ items, title }: NavSectionProps) {
  return (
    <div>
      {title && (
        <h4 className="mb-2 px-4 text-sm font-semibold tracking-tight">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <NavLink key={item.href} to={item.href} icon={item.icon}>
          {item.title}
        </NavLink>
      ))}
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";
  const isMobile = useMobile();
  
  const dashboardLinks: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Creator Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Social Connect",
      href: "/social-connect",
      icon: Instagram,
    },
  ];

  const contentLinks: NavItem[] = [
    {
      title: "Content",
      href: "/content",
      icon: FileText,
    },
    {
      title: "Caption Generator",
      href: "/content/captions",
      icon: PenSquare,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Approvals",
      href: "/content/approval",
      icon: FileText,
    },
  ];

  const communicationLinks: NavItem[] = [
    {
      title: "Messaging",
      href: "/messaging",
      icon: MessageSquare,
    },
    {
      title: "Brand Deals",
      href: "/deals",
      icon: HandshakeIcon,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
  ];

  const billingLinks: NavItem[] = [
    {
      title: "Plans & Pricing",
      href: "/plans",
      icon: CreditCard,
    },
    {
      title: "Payment History",
      href: "/payment-history",
      icon: CreditCard,
    },
  ];

  const settingsLinks: NavItem[] = [
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const adminLinks: NavItem[] = [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: Users,
    },
  ];

  if (isMobile) {
    // Return the mobile sidebar
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-between p-4">
          {dashboardLinks.map((item) => (
            <NavLink key={item.href} to={item.href} icon={item.icon}>
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen pb-12", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Logo withText />
      </div>
      <ScrollArea className="flex-1 py-4">
        <div className="px-4 py-2">
          <NavSection items={dashboardLinks} />
          <Separator className="my-4" />
          <NavSection title="Content" items={contentLinks} />
          <Separator className="my-4" />
          <NavSection title="Communication" items={communicationLinks} />
          <Separator className="my-4" />
          <NavSection title="Billing" items={billingLinks} />
          <Separator className="my-4" />
          <NavSection items={settingsLinks} />
          {isAdmin && (
            <>
              <Separator className="my-4" />
              <NavSection title="Admin" items={adminLinks} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
