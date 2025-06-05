
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentPlanGenerator } from '@/hooks/useContentPlanGenerator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Zap } from 'lucide-react';

const ContentPlanGeneratorPage = () => {
  const { generatePlan, isGenerating, savedPlans, isLoadingPlans } = useContentPlanGenerator();
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const [formData, setFormData] = useState({
    niche: '',
    platforms: [] as string[],
    goal: '',
    duration: 30,
  });

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const plan = await generatePlan(formData);
      setGeneratedPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Plan Generator</h1>
          <p className="text-muted-foreground">
            Generate AI-powered content plans tailored to your niche and goals
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="niche">Niche/Industry</Label>
                  <Input
                    id="niche"
                    value={formData.niche}
                    onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                    placeholder="e.g., Fitness, Travel, Food, Tech"
                    required
                  />
                </div>

                <div>
                  <Label>Target Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map(platform => (
                      <Button
                        key={platform}
                        type="button"
                        variant={formData.platforms.includes(platform.toLowerCase()) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformToggle(platform.toLowerCase())}
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">Content Goal</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Increase Engagement</SelectItem>
                      <SelectItem value="followers">Grow Followers</SelectItem>
                      <SelectItem value="sales">Drive Sales</SelectItem>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="community">Build Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Plan Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="7"
                    max="365"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Content Plan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {generatedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generated Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Plan Overview</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {generatedPlan.description || 'Custom content plan generated for your niche'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.platforms.map(platform => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formData.duration} days</span>
                      <Target className="h-4 w-4 ml-2" />
                      <span>{formData.goal}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Saved Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlans ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : savedPlans.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No saved plans yet. Generate your first plan!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedPlans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-3">
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {plan.content}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline">{plan.goal}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(plan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContentPlanGeneratorPage;
