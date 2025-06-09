
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatorCard } from './CreatorCard';
import { SendOfferModal } from './SendOfferModal';
import { Loader2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreatorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [followerRange, setFollowerRange] = useState('all');
  const [engagementRange, setEngagementRange] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ['creators', searchTerm, followerRange, engagementRange],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          social_profiles!inner (
            platform,
            followers,
            engagement,
            username,
            connected
          )
        `)
        .eq('social_profiles.connected', true)
        .neq('id', user?.id); // Exclude current user

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      
      return data?.filter(creator => {
        const totalFollowers = creator.social_profiles?.reduce((sum: number, profile: any) => 
          sum + (profile.followers || 0), 0) || 0;
        const avgEngagement = creator.social_profiles?.length 
          ? creator.social_profiles.reduce((sum: number, profile: any) => 
              sum + (profile.engagement || 0), 0) / creator.social_profiles.length 
          : 0;

        let followersMatch = true;
        if (followerRange === '1k-10k') followersMatch = totalFollowers >= 1000 && totalFollowers <= 10000;
        else if (followerRange === '10k-100k') followersMatch = totalFollowers >= 10000 && totalFollowers <= 100000;
        else if (followerRange === '100k+') followersMatch = totalFollowers >= 100000;

        let engagementMatch = true;
        if (engagementRange === 'high') engagementMatch = avgEngagement >= 5;
        else if (engagementRange === 'medium') engagementMatch = avgEngagement >= 2 && avgEngagement < 5;
        else if (engagementRange === 'low') engagementMatch = avgEngagement < 2;

        return followersMatch && engagementMatch;
      });
    },
    enabled: !!user?.id,
  });

  const handleSendOffer = (creatorId: string) => {
    setSelectedCreator(creatorId);
    setIsOfferModalOpen(true);
  };

  const handleViewProfile = (creatorId: string) => {
    // Navigate to creator profile page
    console.log('View creator profile:', creatorId);
    toast({
      title: 'Feature Coming Soon',
      description: 'Creator profile viewing will be available soon.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading creators...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Discover Creators</h2>
        <p className="text-muted-foreground">
          Find and connect with talented creators for your brand collaborations
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={followerRange} onValueChange={setFollowerRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Follower range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All followers</SelectItem>
            <SelectItem value="1k-10k">1K - 10K</SelectItem>
            <SelectItem value="10k-100k">10K - 100K</SelectItem>
            <SelectItem value="100k+">100K+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engagementRange} onValueChange={setEngagementRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Engagement rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All engagement</SelectItem>
            <SelectItem value="high">High (5%+)</SelectItem>
            <SelectItem value="medium">Medium (2-5%)</SelectItem>
            <SelectItem value="low">Low (&lt;2%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {creators.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No creators found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search filters or check back later for new creators.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {selectedCreator && (
        <SendOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedCreator(null);
          }}
          creatorId={selectedCreator}
        />
      )}
    </div>
  );
};
