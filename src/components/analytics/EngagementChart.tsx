
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement_rate?: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  timeframe: 'week' | 'month' | 'quarter';
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data, timeframe }) => {
  const processedData = data.map(item => ({
    ...item,
    engagement_rate: item.reach > 0 ? ((item.likes + item.comments + item.shares) / item.reach) * 100 : 0
  }));

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'week':
        return 'Last Week';
      case 'month':
        return 'Last Month';
      case 'quarter':
        return 'Last Quarter';
      default:
        return timeframe;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics ({getTimeframeLabel(timeframe)})</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'engagement_rate') {
                  return [`${value.toFixed(2)}%`, 'Engagement Rate'];
                }
                return [value.toLocaleString(), name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="likes" 
              stroke="#E4405F" 
              strokeWidth={2}
              name="Likes"
            />
            <Line 
              type="monotone" 
              dataKey="comments" 
              stroke="#1DA1F2" 
              strokeWidth={2}
              name="Comments"
            />
            <Line 
              type="monotone" 
              dataKey="shares" 
              stroke="#FF0000" 
              strokeWidth={2}
              name="Shares"
            />
            <Line 
              type="monotone" 
              dataKey="engagement_rate" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Engagement Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
