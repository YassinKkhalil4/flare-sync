
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { getNavigationConfig } from '@/config/navigation';

export const useNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { userRole, isAdmin, isLoading } = useUserRole();

  const isActive = (path: string) => location.pathname === path;
  const isContentSection = location.pathname.startsWith('/content');
  const isAIToolSection = location.pathname.includes('/content/') && 
    (location.pathname.includes('caption-generator') || 
     location.pathname.includes('engagement-predictor') || 
     location.pathname.includes('content-plan') || 
     location.pathname.includes('smart-assistant') ||
     location.pathname.includes('brand-matchmaker') ||
     location.pathname.includes('smart-scheduler'));

  const navigation = getNavigationConfig(userRole, isAdmin);

  return {
    navigation,
    isActive,
    isContentSection,
    isAIToolSection,
    user,
    userRole,
    isLoading
  };
};
