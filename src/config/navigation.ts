
import { 
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

export interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: React.ReactNode;
  children?: SubNavItem[];
}

export interface SubNavItem {
  to: string;
  label: string;
  active?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const getNavigationConfig = (userRole: string | null, isAdmin: boolean) => {
  const commonNavigation: NavSection[] = [
    {
      items: [
        {
          to: '/dashboard',
          icon: Home,
          label: 'Dashboard'
        },
        {
          to: '/analytics',
          icon: PieChart,
          label: 'Analytics'
        }
      ]
    }
  ];

  const creatorNavigation: NavSection[] = [
    {
      items: [
        {
          to: '#',
          icon: ImageIcon,
          label: 'Content',
          children: [
            { to: '/content', label: 'All Content' },
            { to: '/content/calendar', label: 'Calendar' },
            { to: '/content/create', label: 'Create New' },
            { to: '/content/approval', label: 'Approvals' }
          ]
        },
        {
          to: '/social-connect',
          icon: Zap,
          label: 'Social Accounts'
        }
      ]
    }
  ];

  const brandNavigation: NavSection[] = [
    {
      items: [
        {
          to: '/brand/discovery',
          icon: UsersRound,
          label: 'Find Creators'
        },
        {
          to: '/brand/campaigns',
          icon: BarChart3,
          label: 'Campaigns'
        }
      ]
    }
  ];

  const sharedNavigation: NavSection[] = [
    {
      items: [
        {
          to: '/messaging',
          icon: Inbox,
          label: 'Messages'
        },
        {
          to: '/deals',
          icon: CircleDollarSign,
          label: 'Brand Deals'
        }
      ]
    }
  ];

  const aiFeatures: NavSection[] = [
    {
      title: 'AI FEATURES',
      items: [
        {
          to: '/content/caption-generator',
          icon: Sparkles,
          label: 'Caption Generator'
        },
        {
          to: '/content/engagement-predictor',
          icon: LineChart,
          label: 'Engagement Predictor'
        },
        {
          to: '/content/smart-assistant',
          icon: Bot,
          label: 'Smart Assistant'
        },
        {
          to: '/content/smart-scheduler',
          icon: Clock,
          label: 'Smart Scheduler'
        },
        {
          to: '/content/brand-matchmaker',
          icon: Target,
          label: 'Brand Matchmaker'
        }
      ]
    }
  ];

  const adminNavigation: NavSection[] = [
    {
      items: [
        {
          to: '/admin',
          icon: Shield,
          label: 'Admin Dashboard'
        }
      ]
    }
  ];

  const accountNavigation: NavSection[] = [
    {
      items: [
        {
          to: '/plans',
          icon: CreditCard,
          label: 'Plans & Billing'
        },
        {
          to: '/payment-history',
          icon: FileText,
          label: 'Payment History'
        },
        {
          to: '/settings',
          icon: Settings,
          label: 'Settings'
        }
      ]
    }
  ];

  let navigation = [...commonNavigation];

  if (userRole === 'creator') {
    navigation.push(...creatorNavigation);
    navigation.push(...sharedNavigation);
    navigation.push(...aiFeatures);
  } else if (userRole === 'brand') {
    navigation.push(...brandNavigation);
    navigation.push(...sharedNavigation);
  } else {
    navigation.push(...sharedNavigation);
  }

  if (isAdmin) {
    navigation.push(...adminNavigation);
  }

  navigation.push(...accountNavigation);

  return navigation;
};
