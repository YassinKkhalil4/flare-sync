
import React from 'react';
import { Card } from '@/components/ui/card';

const CampaignManagement: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Campaign Management</h1>
      
      <Card className="p-6">
        <p className="text-muted-foreground mb-4">
          Create and manage your brand campaigns, track performance, 
          and coordinate with creators.
        </p>
        
        <div className="bg-primary/10 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-2">Campaign Dashboard</h3>
          <p>Your campaign metrics and creator collaborations will appear here.</p>
        </div>
      </Card>
    </div>
  );
};

export default CampaignManagement;
