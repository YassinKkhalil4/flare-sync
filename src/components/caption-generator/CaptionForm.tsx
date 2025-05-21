
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CaptionGenerationRequest } from '@/types/caption';
import { Sparkles } from 'lucide-react';

const formSchema = z.object({
  platform: z.string({
    required_error: 'Please select a platform',
  }),
  niche: z.string({
    required_error: 'Please enter your content niche',
  }).min(2, 'Niche must be at least 2 characters'),
  tone: z.string({
    required_error: 'Please select a tone',
  }),
  postType: z.string({
    required_error: 'Please select a post type',
  }),
  objective: z.string({
    required_error: 'Please select an objective',
  }),
  description: z.string({
    required_error: 'Please provide a brief description',
  }).min(10, 'Description must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface CaptionFormProps {
  onGenerateCaptions: (values: CaptionGenerationRequest) => void;
  isSubmitting: boolean;
}

export const CaptionForm: React.FC<CaptionFormProps> = ({
  onGenerateCaptions,
  isSubmitting,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'instagram',
      niche: '',
      tone: 'casual',
      postType: 'image',
      objective: 'engagement',
      description: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    onGenerateCaptions(values as CaptionGenerationRequest);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
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
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Which platform are you creating content for?
                </FormDescription>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your niche" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="fashion">Fashion & Style</SelectItem>
                      <SelectItem value="food">Food & Cooking</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  What type of content do you create?
                </FormDescription>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="casual">Casual & Conversational</SelectItem>
                    <SelectItem value="humorous">Funny & Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational & Motivational</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="educational">Informative & Educational</SelectItem>
                    <SelectItem value="authentic">Authentic & Personal</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  What tone do you want for your captions?
                </FormDescription>
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="image">Single Image</SelectItem>
                    <SelectItem value="carousel">Carousel/Slideshow</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="reel">Reel/Short Video</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="text">Text-only</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  What type of post are you creating?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Objective</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="engagement">Boost Engagement</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Drive Traffic</SelectItem>
                  <SelectItem value="sales">Generate Sales</SelectItem>
                  <SelectItem value="followers">Gain Followers</SelectItem>
                  <SelectItem value="education">Educate Audience</SelectItem>
                  <SelectItem value="community">Build Community</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                What is the main goal of this post?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what your post is about. The more details, the better the caption will be."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Briefly describe your post content, key points, and any specific elements you want to highlight.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Generating Captions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Captions
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
