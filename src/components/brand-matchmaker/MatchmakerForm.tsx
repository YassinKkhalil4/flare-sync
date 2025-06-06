
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search } from 'lucide-react';
import { BrandMatchRequest } from '@/types/brandMatchmaking';

interface MatchmakerFormProps {
  onSubmit: (request: BrandMatchRequest) => void;
  isLoading: boolean;
}

export const MatchmakerForm: React.FC<MatchmakerFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, setValue, watch } = useForm<BrandMatchRequest>();

  const industries = [
    'Fashion & Beauty',
    'Technology',
    'Food & Beverage',
    'Travel',
    'Fitness & Health',
    'Gaming',
    'Entertainment',
    'Education',
    'Finance',
    'Automotive'
  ];

  const campaignTypes = [
    'Product Review',
    'Brand Ambassador',
    'Event Coverage',
    'Tutorial/How-to',
    'Unboxing',
    'Lifestyle Integration'
  ];

  const onFormSubmit = (data: BrandMatchRequest) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Brand Matches
        </CardTitle>
        <CardDescription>
          Tell us about your content and audience to find the perfect brand partnerships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Your Niche</Label>
              <Input
                id="niche"
                placeholder="e.g., Fitness, Beauty, Tech"
                {...register('niche')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audienceSize">Audience Size</Label>
              <Input
                id="audienceSize"
                type="number"
                placeholder="10000"
                {...register('audienceSize', { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engagementRate">Engagement Rate (%)</Label>
              <Input
                id="engagementRate"
                type="number"
                step="0.1"
                placeholder="3.5"
                {...register('engagementRate', { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., United States, Global"
                {...register('location')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Budget Range</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="minBudget">Minimum ($)</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    placeholder="500"
                    {...register('filters.minBudget', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Maximum ($)</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    placeholder="5000"
                    {...register('filters.maxBudget', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Preferred Industries</Label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      onCheckedChange={(checked) => {
                        const currentIndustries = watch('filters.industries') || [];
                        if (checked) {
                          setValue('filters.industries', [...currentIndustries, industry]);
                        } else {
                          setValue('filters.industries', currentIndustries.filter(i => i !== industry));
                        }
                      }}
                    />
                    <Label htmlFor={industry} className="text-sm">{industry}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Campaign Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {campaignTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      onCheckedChange={(checked) => {
                        const currentTypes = watch('filters.campaignTypes') || [];
                        if (checked) {
                          setValue('filters.campaignTypes', [...currentTypes, type]);
                        } else {
                          setValue('filters.campaignTypes', currentTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Matches...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Brand Matches
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MatchmakerForm;
