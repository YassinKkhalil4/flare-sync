
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share } from 'lucide-react';

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  timeframe: 'week' | 'month' | 'quarter';
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data, timeframe }) => {
  const totalEngagement = data.reduce((sum, item) => sum + item.likes + item.comments + item.shares, 0);
  const avgEngagement = Math.round(totalEngagement / data.length);
  const trend = data.length > 1 ? ((data[data.length - 1].likes - data[0].likes) / data[0].likes) * 100 : 0;

  const metrics = [
    {
      title: 'Total Likes',
      value: data.reduce((sum, item) => sum + item.likes, 0).toLocaleString(),
      icon: Heart,
      color: 'text-red-500',
      change: '+12.3%'
    },
    {
      title: 'Comments',
      value: data.reduce((sum, item) => sum + item.comments, 0).toLocaleString(),
      icon: MessageCircle,
      color: 'text-blue-500',
      change: '+8.7%'
    },
    {
      title: 'Shares',
      value: data.reduce((sum, item) => sum + item.shares, 0).toLocaleString(),
      icon: Share,
      color: 'text-green-500',
      change: '+15.2%'
    },
    {
      title: 'Reach',
      value: data.reduce((sum, item) => sum + item.reach, 0).toLocaleString(),
      icon: Users,
      color: 'text-purple-500',
      change: '+6.8%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.change}
                  </p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="likes" fill="#ef4444" />
                <Bar dataKey="comments" fill="#3b82f6" />
                <Bar dataKey="shares" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
