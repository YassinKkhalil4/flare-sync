
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, Hash, Image, Video, FileText, TrendingUp, Star } from 'lucide-react';

interface ContentInsight {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'carousel';
  platform: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagementRate: number;
  hashtags: string[];
  bestTime?: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface ContentInsightsProps {
  insights: ContentInsight[];
  topHashtags: { tag: string; usage: number; performance: number }[];
  bestTimes: { time: string; day: string; score: number }[];
}

export const ContentInsights: React.FC<ContentInsightsProps> = ({ 
  insights, 
  topHashtags, 
  bestTimes 
}) => {
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'text': return FileText;
      case 'carousel': return Star;
      default: return FileText;
    }
  };

  const topPerforming = insights
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Content Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerforming.map((content) => {
                const TypeIcon = getTypeIcon(content.type);
                return (
                  <div key={content.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <TypeIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {content.platform}
                        </Badge>
                        <Badge className={`text-xs ${getPerformanceColor(content.performance)}`}>
                          {content.performance}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {content.engagementRate.toFixed(1)}% engagement
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{content.likes.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">likes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Best Posting Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Best Posting Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestTimes.slice(0, 5).map((time, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{time.day}</p>
                    <p className="text-xs text-muted-foreground">{time.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={time.score} className="w-16" />
                    <span className="text-xs font-medium">{time.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hashtag Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Top Performing Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topHashtags.slice(0, 9).map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{hashtag.tag}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{hashtag.performance.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{hashtag.usage} uses</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['photo', 'video', 'text', 'carousel'].map((type) => {
              const typeContent = insights.filter(c => c.type === type);
              const avgEngagement = typeContent.length > 0 
                ? typeContent.reduce((sum, c) => sum + c.engagementRate, 0) / typeContent.length 
                : 0;
              const TypeIcon = getTypeIcon(type);

              return (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <TypeIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-medium capitalize">{type}</h4>
                  <p className="text-2xl font-bold mt-1">{avgEngagement.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">avg engagement</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeContent.length} posts
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
