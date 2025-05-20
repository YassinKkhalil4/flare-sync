
import React from 'react';
import { Card } from '@/components/ui/card';

const CreatorDiscovery: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Find Creators</h1>
      
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Discover creators who align with your brand values and audience demographics.
        </p>
        
        <div className="bg-primary/10 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">Creator Directory</h3>
          <p>Search and filter creators based on metrics, audience, and content categories.</p>
        </div>
      </Card>
    </div>
  );
};

export default CreatorDiscovery;
