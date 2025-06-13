
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CreatorCard } from './CreatorCard';
import { SendOfferModal } from './SendOfferModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Loader2, Users } from 'lucide-react';

interface Creator {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  location: string;
  created_at: string;
  social_profiles: {
    platform: string;
    followers: number;
    engagement: number;
    username: string;
  }[];
}

export const CreatorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { data: creators = [], isLoading, error } = useQuery({
    queryKey: ['creators', searchTerm, sortBy],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          bio,
          location,
          created_at
        `)
        .eq('role', 'creator')
        .ilike('full_name', `%${searchTerm}%`);

      if (profilesError) throw profilesError;

      // Get social profiles separately to avoid join issues
      const { data: socialProfilesData, error: socialError } = await supabase
        .from('social_profiles')
        .select('user_id, platform, followers, engagement, username')
        .eq('connected', true);

      if (socialError) throw socialError;

      // Combine the data
      const creatorsWithSocial = (profilesData || []).map(profile => {
        const userSocialProfiles = (socialProfilesData || [])
          .filter(sp => sp.user_id === profile.id)
          .map(sp => ({
            platform: sp.platform,
            followers: sp.followers || 0,
            engagement: sp.engagement || 0,
            username: sp.username
          }));

        return {
          ...profile,
          social_profiles: userSocialProfiles
        };
      });

      // Calculate total metrics for sorting
      const creatorsWithMetrics = creatorsWithSocial.map(creator => ({
        ...creator,
        totalFollowers: creator.social_profiles?.reduce((sum, profile) => sum + (profile.followers || 0), 0) || 0,
        avgEngagement: creator.social_profiles?.length 
          ? creator.social_profiles.reduce((sum, profile) => sum + (profile.engagement || 0), 0) / creator.social_profiles.length 
          : 0
      }));

      // Sort creators
      const sortedCreators = creatorsWithMetrics.sort((a, b) => {
        switch (sortBy) {
          case 'followers':
            return b.totalFollowers - a.totalFollowers;
          case 'engagement':
            return b.avgEngagement - a.avgEngagement;
          case 'name':
            return (a.full_name || '').localeCompare(b.full_name || '');
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });

      return sortedCreators as Creator[];
    },
  });

  const handleSendOffer = (creatorId: string) => {
    setSelectedCreator(creatorId);
    setIsOfferModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsOfferModalOpen(false);
    setSelectedCreator(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading creators...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">Error loading creators</p>
          <p className="text-muted-foreground">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discover Creators</h1>
        <p className="text-muted-foreground">
          Find and connect with talented creators for your brand collaborations
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="engagement">Best Engagement</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {creators.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No creators found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No creators match "${searchTerm}". Try adjusting your search.`
                : 'No creators have joined the platform yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onSendOffer={() => handleSendOffer(creator.id)}
            />
          ))}
        </div>
      )}

      {/* Send Offer Modal */}
      {selectedCreator && (
        <SendOfferModal
          isOpen={isOfferModalOpen}
          onClose={handleCloseModal}
          creatorId={selectedCreator}
        />
      )}
    </div>
  );
};
