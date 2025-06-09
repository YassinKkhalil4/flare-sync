
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EngagementData {
  date: string;
  instagram: number;
  twitter: number;
  youtube: number;
  average: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  timeRange: string;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data, timeRange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Rate Trends ({timeRange})</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="instagram" 
              stroke="#E4405F" 
              strokeWidth={2}
              name="Instagram"
            />
            <Line 
              type="monotone" 
              dataKey="twitter" 
              stroke="#1DA1F2" 
              strokeWidth={2}
              name="Twitter"
            />
            <Line 
              type="monotone" 
              dataKey="youtube" 
              stroke="#FF0000" 
              strokeWidth={2}
              name="YouTube"
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
