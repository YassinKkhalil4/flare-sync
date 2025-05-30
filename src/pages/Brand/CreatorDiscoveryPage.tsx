
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, TrendingUp, MessageSquare, Star } from 'lucide-react';

// Mock data for creators
const mockCreators = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: '@sarahj_fitness',
    avatar: '/placeholder.svg',
    niche: 'Fitness',
    followers: 125000,
    engagement: 4.2,
    location: 'Los Angeles, CA',
    platforms: ['Instagram', 'TikTok'],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: '@techtalkmike',
    avatar: '/placeholder.svg',
    niche: 'Technology',
    followers: 89000,
    engagement: 3.8,
    location: 'San Francisco, CA',
    platforms: ['YouTube', 'Twitter'],
    rating: 4.6
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: '@emmastyle',
    avatar: '/placeholder.svg',
    niche: 'Fashion',
    followers: 203000,
    engagement: 5.1,
    location: 'New York, NY',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    rating: 4.9
  }
];

export const CreatorDiscoveryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [creators] = useState(mockCreators);

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.niche.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = !selectedNiche || creator.niche === selectedNiche;
    return matchesSearch && matchesNiche;
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Discover Creators</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find the perfect creators for your brand campaigns. 
          Browse profiles, check engagement rates, and connect with influencers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search creators by name, username, or niche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Fitness', 'Technology', 'Fashion', 'Lifestyle'].map((niche) => (
                <Button
                  key={niche}
                  variant={selectedNiche === (niche === 'All' ? '' : niche) ? 'default' : 'outline'}
                  onClick={() => setSelectedNiche(niche === 'All' ? '' : niche)}
                  size="sm"
                >
                  {niche}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => (
          <Card key={creator.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{creator.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{creator.username}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{creator.rating}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{creator.niche}</Badge>
                <span className="text-sm text-muted-foreground">{creator.location}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatFollowers(creator.followers)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{creator.engagement}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {creator.platforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredCreators.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No creators found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CreatorDiscoveryPage;
