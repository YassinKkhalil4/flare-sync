
import React, { useState } from 'react';
import { useContentPlanGenerator } from '@/hooks/useContentPlanGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Edit, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ContentPlanPost } from '@/types/contentPlan';

const formSchema = z.object({
  timeCommitment: z.number().min(1).max(50),
  platforms: z.array(z.string()).min(1),
  goal: z.enum(['growth', 'engagement', 'sales']),
  niche: z.string().min(3),
  additionalInfo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const platformOptions = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Facebook', value: 'facebook' }
];

const goalOptions = [
  { label: 'Audience Growth', value: 'growth' },
  { label: 'Increase Engagement', value: 'engagement' },
  { label: 'Drive Sales/Conversions', value: 'sales' }
];

const ContentPlanGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const { 
    generateContentPlan, 
    isGenerating, 
    contentPlan, 
    savedPlans, 
    isLoadingPlans, 
    saveContentPlan,
    refetchPlans
  } = useContentPlanGenerator();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeCommitment: 10,
      platforms: ['instagram'],
      goal: 'engagement',
      niche: '',
      additionalInfo: ''
    }
  });
  
  const onSubmit = (values: FormValues) => {
    generateContentPlan(values);
  };
  
  const handleSavePlan = () => {
    if (contentPlan) {
      saveContentPlan(contentPlan)
        .then(() => {
          refetchPlans();
          setActiveTab('saved');
        });
    }
  };
  
  const renderPostsByDay = (posts: ContentPlanPost[]) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => {
      const dayPosts = posts?.filter(post => post.day === day) || [];
      
      return (
        <div key={day} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{day}</h3>
          {dayPosts.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <p className="text-muted-foreground text-center">No posts scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dayPosts.map(post => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="mb-1" variant={post.platform === 'instagram' ? 'default' : post.platform === 'tiktok' ? 'destructive' : 'secondary'}>
                          {post.platform}
                        </Badge>
                        <CardTitle className="text-base">{post.title}</CardTitle>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.time}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{post.description}</p>
                    {post.suggestedCaption && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full mt-1">
                            <Edit className="h-3 w-3 mr-2" /> View Caption
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Suggested Caption</DialogTitle>
                          </DialogHeader>
                          <div className="mt-2 border rounded-md p-3 bg-muted/30">
                            <p>{post.suggestedCaption}</p>
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {post.hashtags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Content Plan Generator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Plan</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Content Plan</CardTitle>
                <CardDescription>
                  AI will generate a personalized content plan based on your inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="niche"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Content Niche</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Fitness, Fashion, Tech, Food" {...field} />
                          </FormControl>
                          <FormDescription>
                            What type of content do you create?
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="platforms"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel>Platforms</FormLabel>
                            <FormDescription>
                              Select the platforms you want to create content for
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {platformOptions.map((platform) => (
                              <FormField
                                key={platform.value}
                                control={form.control}
                                name="platforms"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={platform.value}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(platform.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, platform.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== platform.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {platform.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Goal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goalOptions.map((goal) => (
                                <SelectItem key={goal.value} value={goal.value}>
                                  {goal.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timeCommitment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Time Commitment (hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1}
                              max={50}
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>
                            How many hours per week can you dedicate to content creation?
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific content themes, upcoming events, or product launches"
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isGenerating} className="w-full">
                      {isGenerating ? 'Generating...' : 'Generate Content Plan'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Generated Plan Preview */}
            <div className="flex flex-col">
              <Card className="flex-1 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        {contentPlan ? contentPlan.name : 'Your Content Plan'}
                      </CardTitle>
                      <CardDescription>
                        {contentPlan ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>7-day plan</span>
                          </div>
                        ) : (
                          'Generate a plan to see preview'
                        )}
                      </CardDescription>
                    </div>
                    {contentPlan && (
                      <Button onClick={handleSavePlan}>
                        <Save className="h-4 w-4 mr-2" /> Save Plan
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <div className="p-6 overflow-y-auto max-h-[600px]">
                  {!contentPlan ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="rounded-full bg-muted p-6 mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Content Plan Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Fill out the form and generate your personalized content plan
                      </p>
                    </div>
                  ) : (
                    renderPostsByDay(contentPlan.posts)
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Content Plans</CardTitle>
              <CardDescription>
                View and manage your saved content plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : savedPlans && savedPlans.length > 0 ? (
                <div className="grid gap-4">
                  {savedPlans.map((plan) => (
                    <Card key={plan.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()}
                              </span>
                            </CardDescription>
                          </div>
                          <div>
                            <Badge>{plan.goal}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.platforms.map((platform) => (
                            <Badge key={platform} variant="outline">{platform}</Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="p-2 bg-muted rounded-md">
                            <p className="font-semibold">{plan.posts.length}</p>
                            <p className="text-muted-foreground">Total Posts</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md">
                            <p className="font-semibold">{plan.posts.filter(p => p.status === 'draft').length}</p>
                            <p className="text-muted-foreground">Draft</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md">
                            <p className="font-semibold">{plan.posts.filter(p => p.status === 'published').length}</p>
                            <p className="text-muted-foreground">Published</p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No Saved Plans Yet</h3>
                  <p className="text-muted-foreground mb-4">Generate and save your first content plan</p>
                  <Button onClick={() => setActiveTab('generate')}>Create a Plan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPlanGeneratorPage;
