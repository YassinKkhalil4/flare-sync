
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CaptionGenerationRequest } from "@/types/caption";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'youtube'], {
    required_error: "Please select a platform",
  }),
  niche: z.string().min(2, {
    message: "Niche must be at least 2 characters",
  }),
  tone: z.string().min(2, {
    message: "Tone must be at least 2 characters",
  }),
  postType: z.enum(['video', 'photo', 'carousel'], {
    required_error: "Please select a post type",
  }),
  objective: z.enum(['engagement', 'saves', 'brand_interest'], {
    required_error: "Please select an objective",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }).max(300, {
    message: "Description must not exceed 300 characters",
  }),
});

interface CaptionFormProps {
  onSubmit: (values: CaptionGenerationRequest) => void;
  isLoading: boolean;
}

export function CaptionForm({ onSubmit, isLoading }: CaptionFormProps) {
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

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormDescription>
                  Select the platform where you'll post content
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
                <FormDescription>
                  What type of content are you posting?
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
                <FormLabel>Niche</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. fitness, fashion, tech" {...field} />
                </FormControl>
                <FormDescription>
                  Enter your content niche
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
                <FormLabel>Tone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. funny, confident, inspirational" {...field} />
                </FormControl>
                <FormDescription>
                  What tone do you want for your caption?
                </FormDescription>
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
                    <SelectItem value="engagement">Engagement (likes & comments)</SelectItem>
                    <SelectItem value="saves">Saves</SelectItem>
                    <SelectItem value="brand_interest">Brand Interest</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  What's the main goal for this post?
                </FormDescription>
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
              <FormLabel>Post Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Briefly describe what your post is about..." 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide details about the content to generate relevant captions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
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
