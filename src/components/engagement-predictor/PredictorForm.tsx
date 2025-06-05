
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EngagementPredictionRequest } from "@/types/engagement";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  platform: z.enum(["instagram", "tiktok", "youtube"], {
    required_error: "Please select a platform",
  }),
  caption: z.string({
    required_error: "Please enter your post caption",
  }).min(5, "Caption should be at least 5 characters long"),
  scheduledTime: z.string({
    required_error: "Please select a scheduled time",
  }),
  postType: z.enum(["video", "photo", "carousel"], {
    required_error: "Please select a post type",
  }),
});

interface PredictorFormProps {
  onPredict: (values: EngagementPredictionRequest) => void;
  isLoading: boolean;
}

export const PredictorForm = ({ onPredict, isLoading }: PredictorFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "instagram",
      caption: "",
      postType: "photo",
      scheduledTime: new Date().toISOString(),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onPredict({
      content: values.caption,
      platform: values.platform,
      caption: values.caption,
      scheduledTime: values.scheduledTime,
      postType: values.postType,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
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
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a post type" />
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
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    field.onChange(new Date(e.target.value).toISOString());
                  }}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                When do you plan to publish this post?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Caption</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your post caption here..."
                  className="min-h-[100px] resize-y"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Enter the caption text you plan to use for this post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Analyzing...
            </>
          ) : (
            <>
              Predict Engagement
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
