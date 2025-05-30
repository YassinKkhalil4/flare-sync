
import React from 'react';
import LoadingSpinner from './loading-spinner';

interface PageLoadingProps {
  text?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

export default PageLoading;
