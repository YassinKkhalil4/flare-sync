
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';
import { FeatureKey, ResourceKey, useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureAccessProps {
  featureName: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  showUpgradeButton?: boolean;
}

/**
 * A component that restricts access to premium features based on the user's plan
 */
export const FeatureAccess: React.FC<FeatureAccessProps> = ({
  featureName,
  children,
  fallback,
  className = '',
  showUpgradeButton = true,
}) => {
  const { useFeatureCheck } = useFeatureAccess();
  const { data: hasAccess, isLoading } = useFeatureCheck(featureName);
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 border rounded-md bg-gray-50", className)}>
      <Lock className="w-12 h-12 text-gray-400 mb-2" />
      <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        This feature requires a higher plan subscription.
      </p>
      {showUpgradeButton && (
        <Button onClick={() => navigate('/plans')}>
          Upgrade Plan
        </Button>
      )}
    </div>
  );
};

/**
 * A button that will check for feature access before executing the provided action
 */
export const FeatureGuardedButton: React.FC<{
  featureName: FeatureKey;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}> = ({ 
  featureName, 
  onClick, 
  children, 
  className = '',
  variant = 'default',
  disabled = false
}) => {
  const { checkFeatureAccess } = useFeatureAccess();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  
  const handleClick = async () => {
    setChecking(true);
    try {
      const hasAccess = await checkFeatureAccess(featureName);
      if (hasAccess) {
        onClick();
      } else {
        navigate('/plans', { state: { requiredFeature: featureName } });
      }
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      className={className} 
      variant={variant} 
      disabled={disabled || checking}
    >
      {checking ? (
        <>
          <div className="w-4 h-4 border-t-2 border-current rounded-full animate-spin mr-2" />
          Checking...
        </>
      ) : children}
    </Button>
  );
};

/**
 * A component to show usage limits and warnings
 */
export const ResourceLimitWarning: React.FC<{
  resourceName: 'max_posts' | 'max_users' | 'max_social_accounts';
  currentCount: number;
  warningThreshold?: number; // percentage (0-100) at which to start showing warnings
  className?: string;
}> = ({ 
  resourceName, 
  currentCount, 
  warningThreshold = 80,
  className = '' 
}) => {
  const { useResourceLimit } = useFeatureAccess();
  const { data: limit, isLoading } = useResourceLimit(resourceName);
  const [usage, setUsage] = useState(0);
  
  useEffect(() => {
    if (limit && limit > 0) {
      setUsage(Math.round((currentCount / limit) * 100));
    }
  }, [limit, currentCount]);
  
  if (isLoading || !limit) {
    return null;
  }
  
  // Don't show anything if usage is below warning threshold
  if (usage < warningThreshold) {
    return null;
  }
  
  const isExceeded = currentCount >= limit;
  
  return (
    <div className={cn(
      "flex items-center p-2 rounded-md text-sm",
      isExceeded ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800",
      className
    )}>
      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
      <span>
        {isExceeded ? (
          <>You have reached your limit of {limit} {resourceName.replace('max_', '')}. <Button variant="link" className="h-auto p-0 text-sm" onClick={() => window.location.href = '/plans'}>Upgrade your plan</Button> to increase this limit.</>
        ) : (
          <>You are using {currentCount} of {limit} {resourceName.replace('max_', '')} ({usage}%).</>
        )}
      </span>
    </div>
  );
};
