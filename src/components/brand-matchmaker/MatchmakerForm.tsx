
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandMatchRequest } from '@/types/brandMatchmaking';
import { Loader2, Search } from 'lucide-react';

const formSchema = z.object({
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  campaignTypes: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

const campaignTypeOptions = [
  { id: 'sponsored_post', label: 'Sponsored Post' },
  { id: 'affiliate', label: 'Affiliate Marketing' },
  { id: 'brand_ambassador', label: 'Brand Ambassador' },
  { id: 'product_review', label: 'Product Review' },
  { id: 'event', label: 'Event Promotion' },
];

const industryOptions = [
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'technology', label: 'Technology' },
  { id: 'fitness', label: 'Fitness & Health' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'travel', label: 'Travel' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'finance', label: 'Finance' },
];

interface MatchmakerFormProps {
  onFindMatches: (request: BrandMatchRequest) => void;
  isLoading: boolean;
  creatorId: string;
}

export function MatchmakerForm({ onFindMatches, isLoading, creatorId }: MatchmakerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minBudget: '',
      maxBudget: '',
      campaignTypes: [],
      industries: [],
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const request: BrandMatchRequest = {
      creatorId,
      filters: {
        minBudget: values.minBudget ? parseInt(values.minBudget) : undefined,
        maxBudget: values.maxBudget ? parseInt(values.maxBudget) : undefined,
        campaignTypes: values.campaignTypes,
        industries: values.industries,
      }
    };
    
    onFindMatches(request);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Budget</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Budget</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="No limit"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="campaignTypes"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Campaign Types</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {campaignTypeOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="campaignTypes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    )
                              }}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industries"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>Industries</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {industryOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="industries"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], option.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id
                                      )
                                    )
                              }}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Matches...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Find Brand Matches
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
