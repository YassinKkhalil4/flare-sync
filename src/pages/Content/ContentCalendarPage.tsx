
import React from 'react';
import { Card } from '@/components/ui/card';
import ContentScheduler from '@/components/content/ContentScheduler';

const ContentCalendarPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Content Calendar</h1>
      
      <Card className="p-6">
        <ContentScheduler />
      </Card>
    </div>
  );
};

export default ContentCalendarPage;
