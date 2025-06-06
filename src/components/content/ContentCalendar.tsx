
import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useRealContent } from '@/hooks/useRealContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'scheduled' | 'published';
    platform: string;
    status: string;
    content: string;
  };
}

const ContentCalendar: React.FC = () => {
  const { posts, scheduledPosts, isLoadingPosts, isLoadingScheduled } = useRealContent();
  const [view, setView] = useState<View>('month');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const events = useMemo((): CalendarEvent[] => {
    const allEvents: CalendarEvent[] = [];

    // Add scheduled posts
    scheduledPosts.forEach(post => {
      const scheduledDate = new Date(post.scheduled_for);
      allEvents.push({
        id: post.id,
        title: post.metadata?.title || 'Scheduled Post',
        start: scheduledDate,
        end: new Date(scheduledDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: {
          type: 'scheduled',
          platform: post.platform,
          status: post.status,
          content: post.content || '',
        },
      });
    });

    // Add published posts
    posts.forEach(post => {
      if (post.published_at) {
        const publishedDate = new Date(post.published_at);
        allEvents.push({
          id: post.id,
          title: post.title,
          start: publishedDate,
          end: new Date(publishedDate.getTime() + 60 * 60 * 1000),
          resource: {
            type: 'published',
            platform: post.platform,
            status: post.status,
            content: post.body || '',
          },
        });
      }
    });

    // Filter by platform if selected
    if (selectedPlatform !== 'all') {
      return allEvents.filter(event => event.resource.platform === selectedPlatform);
    }

    return allEvents;
  }, [posts, scheduledPosts, selectedPlatform]);

  const platforms = useMemo(() => {
    const platformSet = new Set<string>();
    [...posts, ...scheduledPosts].forEach(post => {
      platformSet.add(post.platform);
    });
    return Array.from(platformSet);
  }, [posts, scheduledPosts]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    if (event.resource.type === 'scheduled') {
      backgroundColor = '#2563eb'; // Blue for scheduled
    } else if (event.resource.type === 'published') {
      backgroundColor = '#16a34a'; // Green for published
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Selected event:', event);
    // TODO: Open event details modal
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    console.log('Selected slot:', start);
    // TODO: Open create post modal with pre-filled date
  };

  if (isLoadingPosts || isLoadingScheduled) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              popup
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm">Scheduled Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-sm">Published Posts</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentCalendar;
