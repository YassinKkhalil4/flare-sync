
import { useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CaptionGenerationRequest } from '@/types/caption';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'youtube']),
  niche: z.string().min(1, { message: 'Niche is required' }),
  tone: z.string().min(1, { message: 'Tone is required' }),
  postType: z.enum(['video', 'photo', 'carousel']),
  objective: z.enum(['engagement', 'saves', 'brand_interest']),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

interface CaptionFormProps {
  onGenerateCaptions: (data: CaptionGenerationRequest) => void;
  isGenerating: boolean;
}

export function CaptionForm({ onGenerateCaptions, isGenerating }: CaptionFormProps) {
  const [activeTab, setActiveTab] = useState<string>('instagram');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'instagram',
      niche: '',
      tone: '',
      postType: 'photo',
      objective: 'engagement',
      description: '',
    },
  });

  function onSubmit(values: FormValues) {
    const captionRequest: CaptionGenerationRequest = {
      platform: values.platform,
      niche: values.niche,
      tone: values.tone,
      postType: values.postType,
      objective: values.objective,
      description: values.description,
    };
    
    onGenerateCaptions(captionRequest);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          form.setValue('platform', value as 'instagram' | 'tiktok' | 'youtube');
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instagram" className="mt-4">
            <FormDescription>
              Optimize your captions for Instagram's audience and algorithm.
            </FormDescription>
          </TabsContent>
          
          <TabsContent value="tiktok" className="mt-4">
            <FormDescription>
              Create engaging TikTok captions that drive views and follows.
            </FormDescription>
          </TabsContent>
          
          <TabsContent value="youtube" className="mt-4">
            <FormDescription>
              Generate YouTube captions optimized for search and engagement.
            </FormDescription>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Niche</FormLabel>
                <FormControl>
                  <Input placeholder="fitness, fashion, tech, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption Tone</FormLabel>
                <FormControl>
                  <Input placeholder="funny, confident, inspirational, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objective</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="engagement">Maximize Engagement</SelectItem>
                    <SelectItem value="saves">Increase Saves</SelectItem>
                    <SelectItem value="brand_interest">Generate Brand Interest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what your post is about..." 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Captions...
            </>
          ) : (
            'Generate Captions'
          )}
        </Button>
      </form>
    </Form>
  );
}
