
import React from 'react';
import InteractiveCalendar from '@/components/content/InteractiveCalendar';

const ContentCalendarPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage your content posts across all platforms
        </p>
      </div>
      
      <InteractiveCalendar />
    </div>
  );
};

export default ContentCalendarPage;
