
export interface RouteConfig {
  path: string;
  title: string;
  component: string;
  requiresAuth?: boolean;
  requiresRole?: string;
  icon?: string;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    title: 'Home',
    component: 'LandingPage',
    requiresAuth: false
  },
  {
    path: '/login',
    title: 'Login',
    component: 'Login',
    requiresAuth: false
  },
  {
    path: '/signup',
    title: 'Sign Up',
    component: 'Signup',
    requiresAuth: false
  }
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    component: 'Dashboard',
    requiresAuth: true,
    icon: 'LayoutDashboard'
  },
  {
    path: '/content',
    title: 'Content',
    component: 'Content',
    requiresAuth: true,
    icon: 'FileText'
  },
  {
    path: '/content/create',
    title: 'Create Content',
    component: 'ContentCreatePage',
    requiresAuth: true
  },
  {
    path: '/content/edit/:id',
    title: 'Edit Content',
    component: 'ContentEditPage',
    requiresAuth: true
  },
  {
    path: '/content/detail/:id',
    title: 'Content Detail',
    component: 'ContentDetailPage',
    requiresAuth: true
  },
  {
    path: '/content/list',
    title: 'Content List',
    component: 'ContentListPage',
    requiresAuth: true
  },
  {
    path: '/content/scheduler',
    title: 'Smart Scheduler',
    component: 'SmartPostSchedulerPage',
    requiresAuth: true
  },
  {
    path: '/social',
    title: 'Social Accounts',
    component: 'SocialAccounts',
    requiresAuth: true,
    icon: 'Users'
  },
  {
    path: '/messaging',
    title: 'Messages',
    component: 'Messaging',
    requiresAuth: true,
    icon: 'MessageSquare'
  },
  {
    path: '/profile',
    title: 'Profile',
    component: 'Profile',
    requiresAuth: true,
    icon: 'User'
  },
  {
    path: '/brand-deals',
    title: 'Brand Deals',
    component: 'BrandDeals',
    requiresAuth: true,
    icon: 'Handshake'
  },
  {
    path: '/settings',
    title: 'Settings',
    component: 'Settings',
    requiresAuth: true,
    icon: 'Settings'
  },
  {
    path: '/billing',
    title: 'Billing',
    component: 'Plans',
    requiresAuth: true,
    icon: 'CreditCard'
  },
  {
    path: '/caption-generator',
    title: 'Caption Generator',
    component: 'CaptionGenerator',
    requiresAuth: true,
    icon: 'Wand2'
  },
  {
    path: '/engagement-predictor',
    title: 'Engagement Predictor',
    component: 'EngagementPredictor',
    requiresAuth: true,
    icon: 'TrendingUp'
  },
  {
    path: '/brand-matchmaker',
    title: 'Brand Matchmaker',
    component: 'BrandMatchmaker',
    requiresAuth: true,
    icon: 'Heart'
  }
];

export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin',
    title: 'Admin Dashboard',
    component: 'AdminDashboard',
    requiresAuth: true,
    requiresRole: 'admin',
    icon: 'Shield'
  },
  {
    path: '/admin/users',
    title: 'User Management',
    component: 'AdminUsers',
    requiresAuth: true,
    requiresRole: 'admin'
  },
  {
    path: '/admin/content',
    title: 'Content Moderation',
    component: 'AdminContent',
    requiresAuth: true,
    requiresRole: 'admin'
  }
];

export const allRoutes = [...publicRoutes, ...protectedRoutes, ...adminRoutes];

export const getRoutesByRole = (role?: string) => {
  const routes = [...publicRoutes, ...protectedRoutes];
  
  if (role?.includes('admin')) {
    routes.push(...adminRoutes);
  }
  
  return routes;
};

export const findRouteByPath = (path: string) => {
  return allRoutes.find(route => route.path === path);
};
