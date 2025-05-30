
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Sparkles, Download } from 'lucide-react';
import { useContentPlanGenerator } from '@/hooks/useContentPlanGenerator';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';

export const ContentPlanGeneratorPage: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [goals, setGoals] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  const { generateContentPlan, isGenerating, contentPlan } = useContentPlanGenerator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateContentPlan({
      niche,
      audience,
      goals,
      timeframe,
      platforms,
      goal: 'engagement'
    });
  };

  const handlePlatformChange = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Content Plan Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate comprehensive content plans tailored to your niche and audience. 
          Get post ideas, scheduling suggestions, and content themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Plan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="niche">Content Niche</Label>
                <Input
                  id="niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Fitness, Technology, Lifestyle"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., Young professionals, Parents, Students"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Content Goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What do you want to achieve with your content?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platforms</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map((platform) => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={platforms.includes(platform)}
                        onChange={() => handlePlatformChange(platform)}
                        className="rounded"
                      />
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isGenerating || !niche || !audience || !goals || !timeframe}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content Plan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Plan</span>
              {contentPlan && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : contentPlan ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: contentPlan.content }} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure your plan settings and click generate to create your content plan.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPlanGeneratorPage;
