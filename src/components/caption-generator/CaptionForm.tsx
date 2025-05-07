
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { CaptionGenerationRequest } from '@/types/caption';

export interface CaptionFormProps {
  isSubmitting: boolean;
  onGenerateCaptions: (values: CaptionGenerationRequest) => void;
}

const formSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'youtube'], {
    required_error: 'Please select a platform',
  }),
  niche: z.string().min(2, {
    message: 'Niche must be at least 2 characters',
  }),
  tone: z.string().min(2, {
    message: 'Tone must be at least 2 characters',
  }),
  postType: z.enum(['video', 'photo', 'carousel'], {
    required_error: 'Please select a post type',
  }),
  objective: z.enum(['engagement', 'saves', 'brand_interest'], {
    required_error: 'Please select an objective',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters',
  }),
});

export const CaptionForm: React.FC<CaptionFormProps> = ({ isSubmitting, onGenerateCaptions }) => {
  const form = useForm<z.infer<typeof formSchema>>({
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

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onGenerateCaptions(values as CaptionGenerationRequest);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Type</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
            name="niche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Niche</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. Fitness, Travel, Fashion"
                    {...field}
                  />
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
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. Professional, Casual, Humorous"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-1">
                <FormLabel>Objective</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                  disabled={isSubmitting}
                  placeholder="Describe your content in detail to get the best captions..."
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Captions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate AI Captions
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CaptionForm;
