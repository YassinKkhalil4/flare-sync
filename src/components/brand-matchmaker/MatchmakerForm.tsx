
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandMatchRequest } from '@/types/brandMatchmaking';
import { Loader2, Search, DollarSign, Briefcase, Building } from 'lucide-react';

const formSchema = z.object({
  minBudget: z.string().optional(),
  maxBudget: z.string().optional(),
  campaignTypes: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

const campaignTypeOptions = [
  { id: 'sponsored_post', label: 'Sponsored Post', icon: '📱' },
  { id: 'affiliate', label: 'Affiliate Marketing', icon: '🤝' },
  { id: 'brand_ambassador', label: 'Brand Ambassador', icon: '👑' },
  { id: 'product_review', label: 'Product Review', icon: '⭐' },
  { id: 'event', label: 'Event Promotion', icon: '🎉' },
];

const industryOptions = [
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'fitness', label: 'Fitness & Health', icon: '💪' },
  { id: 'food', label: 'Food & Beverage', icon: '🍕' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'finance', label: 'Finance', icon: '💰' },
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
        {/* Budget Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Budget Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Budget ($)</FormLabel>
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
                    <FormLabel>Maximum Budget ($)</FormLabel>
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
          </CardContent>
        </Card>

        {/* Campaign Types Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Campaign Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="campaignTypes"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaignTypeOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="campaignTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors"
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
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.icon}</span>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </div>
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
          </CardContent>
        </Card>

        {/* Industries Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="industries"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {industryOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="industries"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors"
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
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.icon}</span>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </div>
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
          </CardContent>
        </Card>
        
        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                Finding Perfect Matches...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" /> 
                Find My Brand Matches
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
