
import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIFeaturesBadgeProps {
  className?: string;
}

const AIFeaturesBadge: React.FC<AIFeaturesBadgeProps> = ({ className }) => {
  return (
    <div className={cn(
      "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary",
      className
    )}>
      <Sparkles className="h-3 w-3 mr-0.5" />
      <span>AI</span>
    </div>
  );
};

export default AIFeaturesBadge;
