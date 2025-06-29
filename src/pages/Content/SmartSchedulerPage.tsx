
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useScheduler } from '@/hooks/useScheduler';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';

interface OptimalTime {
  day: number;
  time: string;
  score: number;
}

export const SmartSchedulerPage: React.FC = () => {
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [audienceLocation, setAudienceLocation] = useState('');
  const [postCount, setPostCount] = useState('7');
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  
  const { analyzeSchedule, isAnalyzing } = useScheduler();

  const handleAnalyze = async () => {
    if (!platform || !contentType || !audienceLocation) return;
    
    try {
      const result = await analyzeSchedule({
        platform,
        contentType,
        audienceLocation,
        postCount: parseInt(postCount)
      });

      if (result) {
        setOptimalTimes(result);
      }
    } catch (error) {
      console.error('Error analyzing schedule:', error);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Smart Post Scheduler</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Optimize your posting schedule for maximum engagement. 
          Get AI-powered recommendations for the best times to post.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel/Short</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Audience Location</Label>
              <Select value={audienceLocation} onValueChange={setAudienceLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US/Eastern">US Eastern</SelectItem>
                  <SelectItem value="US/Central">US Central</SelectItem>
                  <SelectItem value="US/Mountain">US Mountain</SelectItem>
                  <SelectItem value="US/Pacific">US Pacific</SelectItem>
                  <SelectItem value="Europe/London">UK/London</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postCount">Posts per Week</Label>
              <Input
                id="postCount"
                type="number"
                value={postCount}
                onChange={(e) => setPostCount(e.target.value)}
                min="1"
                max="21"
              />
            </div>

            <Button 
              onClick={handleAnalyze}
              className="w-full"
              disabled={isAnalyzing || !platform || !contentType || !audienceLocation}
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Get Optimal Times
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recommended Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : optimalTimes && optimalTimes.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Here are the optimal posting times based on your audience and content type:
                </div>
                {optimalTimes.map((timeSlot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{getDayName(timeSlot.day)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(timeSlot.time)}
                      </div>
                    </div>
                    <Badge className={getScoreColor(timeSlot.score)}>
                      {timeSlot.score}% engagement
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your settings and click analyze to get optimal posting times.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartSchedulerPage;
