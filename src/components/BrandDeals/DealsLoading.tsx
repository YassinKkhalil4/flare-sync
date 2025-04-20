
import React from 'react';
import { Loader2 } from 'lucide-react';

export const DealsLoading: React.FC = () => (
  <div className="container py-8 flex justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p>Loading deals...</p>
    </div>
  </div>
);

