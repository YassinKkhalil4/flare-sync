
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyLoadingWrapper: React.FC<LazyLoadingWrapperProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyLoadingWrapper;
