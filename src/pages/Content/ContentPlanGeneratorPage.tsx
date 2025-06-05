
import React, { useState } from 'react';
import { useContentPlanGenerator } from '@/hooks/useContentPlanGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Zap } from 'lucide-react';

const ContentPlanGeneratorPage: React.FC = () => {
  const { generateContentPlan, isGenerating, contentPlans, isLoadingPlans, contentPlan } = useContentPlanGenerator();
  
  const [formData, setFormData] = useState({
    timeCommitment: '',
    platforms: [] as string[],
    goal: '',
    niche: '',
    additionalInfo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateContentPlan(formData);
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Content Plan Generator</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Your Content Plan</CardTitle>
            <CardDescription>
              Let AI create a personalized content strategy for your social media presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Select value={formData.timeCommitment} onValueChange={(value) => setFormData(prev => ({ ...prev, timeCommitment: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 hours/day">1-2 hours per day</SelectItem>
                    <SelectItem value="3-4 hours/day">3-4 hours per day</SelectItem>
                    <SelectItem value="5+ hours/day">5+ hours per day</SelectItem>
                    <SelectItem value="part-time">Part-time (weekends)</SelectItem>
                    <SelectItem value="full-time">Full-time commitment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Platforms</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={formData.platforms.includes(platform)}
                        onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                      />
                      <Label htmlFor={platform}>{platform}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="goal">Primary Goal</Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main objective?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                    <SelectItem value="engagement">Increase Engagement</SelectItem>
                    <SelectItem value="followers">Grow Followers</SelectItem>
                    <SelectItem value="sales">Drive Sales</SelectItem>
                    <SelectItem value="education">Educational Content</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="niche">Niche/Industry</Label>
                <Input
                  id="niche"
                  value={formData.niche}
                  onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                  placeholder="e.g., Fitness, Technology, Fashion, Food..."
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any specific requirements, target audience details, or preferences..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isGenerating || !formData.timeCommitment || !formData.goal || !formData.niche || formData.platforms.length === 0}
              >
                {isGenerating ? 'Generating Plan...' : 'Generate Content Plan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Content Plan</CardTitle>
            <CardDescription>
              AI-generated content strategy and posting schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : contentPlan ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{contentPlan.name}</h3>
                  <p className="text-muted-foreground mb-4">{contentPlan.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(contentPlan.startDate).toLocaleDateString()} - {new Date(contentPlan.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {contentPlan.posts.length} posts planned
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Upcoming Posts</h4>
                  <div className="space-y-3">
                    {contentPlan.posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{post.title}</h5>
                          <Badge variant="outline">{post.platform}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{post.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.day} at {post.time}
                          <Badge variant="secondary" className="text-xs">{post.contentType}</Badge>
                        </div>
                        {post.hashtags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="text-xs text-blue-600">#{tag}</span>
                            ))}
                            {post.hashtags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="rounded-full bg-primary/10 p-4 inline-block mb-3">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">Generate Your Content Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Fill out the form to create an AI-powered content strategy
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {contentPlans && contentPlans.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Previous Content Plans</CardTitle>
            <CardDescription>
              Your previously generated content strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentPlanGeneratorPage;
