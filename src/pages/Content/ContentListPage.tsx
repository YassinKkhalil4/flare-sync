
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ContentList } from '@/components/content/ContentList';
import { ScheduledPosts } from '@/components/content/ScheduledPosts';
import { ContentAPI } from '@/services/contentService';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Sparkles, MessageCircle, Brain } from 'lucide-react';

export const ContentListPage = () => {
  const navigate = useNavigate();
  
  // Fetch content posts using react-query
  const { data: posts, isLoading } = useQuery({
    queryKey: ['contentPosts'],
    queryFn: () => ContentAPI.getPosts()
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <Button onClick={() => navigate('/content/create')}>Create New Post</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Pass the required posts and isLoading props to ContentList */}
          <ContentList posts={posts || []} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <ScheduledPosts />

          {/* AI Tools Section */}
          <div>
            <h2 className="text-xl font-semibold mb-3">AI Tools</h2>
            <div className="space-y-3">
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/captions')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Caption Generator
                  </CardTitle>
                  <CardDescription>
                    AI-powered captions for your social media posts
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/engagement')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    Engagement Predictor
                  </CardTitle>
                  <CardDescription>
                    Predict how well your content will perform
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/brand-matchmaker')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    Brand Matchmaker
                  </CardTitle>
                  <CardDescription>
                    Find brands that match your creator profile
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/plan-generator')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Content Plan Generator
                  </CardTitle>
                  <CardDescription>
                    Generate complete content plans for your channels
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/smart-assistant')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                    Smart Assistant
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered answers to your content questions
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/content/smart-scheduler')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Smart Post Scheduler
                  </CardTitle>
                  <CardDescription>
                    Optimize posting times for maximum engagement
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentListPage;
