
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Instagram, Twitter, Facebook, Youtube, TrendingUp } from 'lucide-react';

interface PlatformData {
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  avgLikes: number;
  avgComments: number;
  growthRate: number;
  color: string;
}

interface PlatformComparisonProps {
  data: PlatformData[];
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

export const PlatformComparison: React.FC<PlatformComparisonProps> = ({ data }) => {
  const totalFollowers = data.reduce((sum, platform) => sum + platform.followers, 0);
  const bestPerforming = data.reduce((best, current) => 
    current.engagement > best.engagement ? current : best
  );

  return (
    <div className="space-y-6">
      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((platform, index) => {
          const IconComponent = platformIcons[platform.platform as keyof typeof platformIcons] || TrendingUp;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" style={{ color: platform.color }} />
                    <span className="font-medium capitalize">{platform.platform}</span>
                  </div>
                  <Badge variant={platform.growthRate > 0 ? 'default' : 'secondary'}>
                    {platform.growthRate > 0 ? '+' : ''}{platform.growthRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-xl font-bold">{platform.followers.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress value={platform.engagement} className="flex-1" />
                      <span className="text-sm font-medium">{platform.engagement.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Likes</p>
                      <p className="text-sm font-medium">{platform.avgLikes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posts</p>
                      <p className="text-sm font-medium">{platform.posts}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#8884d8" name="Engagement Rate %" />
                <Bar dataKey="growthRate" fill="#82ca9d" name="Growth Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Audience Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ platform, value }) => `${platform}: ${((value / totalFollowers) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="followers"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Followers']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performer Highlight */}
      <Card>
        <CardHeader>
          <CardTitle>Best Performing Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {React.createElement(
                platformIcons[bestPerforming.platform as keyof typeof platformIcons] || TrendingUp,
                { className: "h-8 w-8", style: { color: bestPerforming.color } }
              )}
              <div>
                <h3 className="text-lg font-semibold capitalize">{bestPerforming.platform}</h3>
                <p className="text-sm text-muted-foreground">
                  {bestPerforming.engagement.toFixed(1)}% engagement rate
                </p>
              </div>
            </div>
            <div className="flex-1" />
            <div className="text-right">
              <p className="text-2xl font-bold">{bestPerforming.followers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">followers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
