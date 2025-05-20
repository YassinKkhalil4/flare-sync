
import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';

const CreatorDiscovery: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Find Creators</h1>
        
        <Card className="p-6">
          <p className="text-muted-foreground mb-4">
            Discover creators that match your brand's values and audience. 
            Filter by niche, followers, engagement rate and more.
          </p>
          
          <div className="bg-primary/10 p-6 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-2">Creator Discovery</h3>
            <p>This feature is currently being populated with real creator profiles.</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreatorDiscovery;
