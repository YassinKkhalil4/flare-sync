
import React, { useState } from 'react';
import { useBrandMatchmaker } from '@/hooks/useBrandMatchmaker';
import MatchmakerForm from '@/components/brand-matchmaker/MatchmakerForm';
import MatchResults from '@/components/brand-matchmaker/MatchResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { BrandMatchRequest, BrandMatchResult } from '@/types/brandMatchmaking';

const BrandMatchmakerPage: React.FC = () => {
  const { findMatches, isMatching } = useBrandMatchmaker();
  const [matchResults, setMatchResults] = useState<BrandMatchResult[]>([]);

  const handleFindMatches = async (request: BrandMatchRequest) => {
    try {
      const results = await findMatches(request);
      if (results) {
        setMatchResults(results);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Brand Matchmaker</h1>
        <p className="text-muted-foreground mt-2">
          Find perfect brand partnerships based on your audience and content style
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5/10</div>
            <p className="text-xs text-muted-foreground">High compatibility</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450</div>
            <p className="text-xs text-muted-foreground">Per collaboration</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="finder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="finder">Find Matches</TabsTrigger>
          <TabsTrigger value="results">Results ({matchResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="finder" className="space-y-6">
          <MatchmakerForm
            onSubmit={handleFindMatches}
            isLoading={isMatching}
          />
        </TabsContent>

        <TabsContent value="results">
          {matchResults.length > 0 ? (
            <MatchResults matches={matchResults} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Matches Yet</h3>
                <p className="text-muted-foreground">
                  Use the Find Matches tab to discover potential brand partnerships
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandMatchmakerPage;
