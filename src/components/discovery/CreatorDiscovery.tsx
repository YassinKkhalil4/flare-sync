
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreatorCard } from './CreatorCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, Users } from 'lucide-react';

export const CreatorDiscovery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [engagementFilter, setEngagementFilter] = useState('all');

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ['creators', searchTerm, platformFilter, engagementFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          role,
          social_profiles (
            platform,
            followers,
            engagement,
            username
          )
        `)
        .eq('role', 'creator');

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by platform and engagement on the client side
      let filteredData = data || [];

      if (platformFilter !== 'all') {
        filteredData = filteredData.filter(creator => 
          creator.social_profiles?.some(profile => profile.platform === platformFilter)
        );
      }

      if (engagementFilter !== 'all') {
        const minEngagement = engagementFilter === 'high' ? 5 : engagementFilter === 'medium' ? 3 : 0;
        const maxEngagement = engagementFilter === 'high' ? 100 : engagementFilter === 'medium' ? 5 : 3;
        
        filteredData = filteredData.filter(creator => {
          const avgEngagement = creator.social_profiles?.length 
            ? creator.social_profiles.reduce((sum, profile) => sum + (profile.engagement || 0), 0) / creator.social_profiles.length 
            : 0;
          return avgEngagement >= minEngagement && avgEngagement < (engagementFilter === 'high' ? 100 : maxEngagement);
        });
      }

      return filteredData;
    },
  });

  const handleSendOffer = (creatorId: string) => {
    // Navigate to send offer form
    console.log('Send offer to creator:', creatorId);
  };

  const handleViewProfile = (creatorId: string) => {
    // Navigate to creator profile
    console.log('View creator profile:', creatorId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Creators</h1>
        <p className="text-muted-foreground mt-2">
          Find and connect with talented content creators for your brand campaigns
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search creators by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engagementFilter} onValueChange={setEngagementFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Engagement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engagement</SelectItem>
            <SelectItem value="high">High (5%+)</SelectItem>
            <SelectItem value="medium">Medium (3-5%)</SelectItem>
            <SelectItem value="low">Low (&lt;3%)</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Discovering creators...</span>
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Creators Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more creators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onSendOffer={handleSendOffer}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
