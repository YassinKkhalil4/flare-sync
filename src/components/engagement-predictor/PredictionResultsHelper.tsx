
// This helper file will be used to address issues in PredictionResults.tsx
import React from 'react';

export const createResultHelpers = () => {
  // Return custom progress component that doesn't use indicatorClassName
  const CustomProgress = ({ value, className }: { value: number, className?: string }) => {
    return (
      <div className={className}>
        <div style={{ width: `${value}%` }} className="h-full bg-primary rounded-full transition-all" />
      </div>
    );
  };
  
  return { CustomProgress };
};

// The actual fix would be to update PredictionResults.tsx to use the Progress component properly
// without passing the indicatorClassName prop which doesn't exist
