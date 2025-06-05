
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Calendar } from 'lucide-react';
import { SchedulingData } from '@/hooks/useScheduler';

interface SchedulingAnalyticsProps {
  schedulingData: SchedulingData;
}

export const SchedulingAnalytics: React.FC<SchedulingAnalyticsProps> = ({ schedulingData }) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Optimal Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Optimal Posting Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedulingData.optimalTimes.map((dayData, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{dayData.day}</h3>
                <div className="space-y-1">
                  {dayData.times.map((time, timeIndex) => (
                    <Badge key={timeIndex} variant="secondary" className="mr-2">
                      {formatTime(time)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-24 gap-1 mb-4">
            {/* Hour labels */}
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="text-xs text-center text-muted-foreground">
                {hour % 6 === 0 ? `${hour}h` : ''}
              </div>
            ))}
            
            {/* Heatmap data */}
            {Array.from({ length: 7 }, (_, day) => (
              <React.Fragment key={day}>
                {Array.from({ length: 24 }, (_, hour) => {
                  const dataPoint = schedulingData.heatmap.find(
                    h => h.day === day && h.hour === hour
                  );
                  const intensity = dataPoint?.value || 0;
                  const opacity = Math.max(0.1, intensity);
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="h-6 rounded"
                      style={{
                        backgroundColor: `rgba(34, 197, 94, ${opacity})`,
                      }}
                      title={`Day ${day}, Hour ${hour}: ${Math.round(intensity * 100)}% engagement`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Green intensity indicates higher engagement rates
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {schedulingData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
