
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchmakerForm } from '@/components/brand-matchmaker/MatchmakerForm';
import { MatchResults } from '@/components/brand-matchmaker/MatchResults';
import { Target, Search, Star } from 'lucide-react';
import { BrandMatch, BrandMatchRequest } from '@/types/brandMatchmaking';

export const BrandMatchmakerPage: React.FC = () => {
  const [matches, setMatches] = useState<BrandMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleFindMatches = (request: BrandMatchRequest) => {
    setIsSearching(true);
    // Simulate API call with mock data
    setTimeout(() => {
      const mockMatches: BrandMatch[] = [
        {
          id: '1',
          brandId: 'brand-1',
          brandName: 'TechFlow',
          matchScore: 92,
          compatibility: 'Excellent',
          estimatedMetrics: {
            cpm: 15,
            ctr: 3.2,
            roi: 180
          },
          reasonForMatch: [
            'Perfect audience alignment with tech-savvy millennials',
            'High engagement rate matches brand requirements'
          ]
        }
      ];
      setMatches(mockMatches);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Brand Matchmaker</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find the perfect brand partnerships for your content. 
          Our AI analyzes your profile and content to suggest compatible brands.
        </p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Matches
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Find Brand Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchmakerForm 
                onFindMatches={handleFindMatches}
                isLoading={isSearching}
                creatorId="user-123"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <MatchResults 
            results={matches}
            isLoading={isSearching}
            onContactBrand={(brandId) => console.log('Contact brand:', brandId)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandMatchmakerPage;
