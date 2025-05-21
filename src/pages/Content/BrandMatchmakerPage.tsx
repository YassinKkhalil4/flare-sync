
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchmakerForm } from '@/components/brand-matchmaker/MatchmakerForm';
import { MatchResults } from '@/components/brand-matchmaker/MatchResults';
import { useBrandMatchmaker } from '@/hooks/useBrandMatchmaker';
import { BrandMatchRequest, BrandMatchResult } from '@/types/brandMatchmaking';
import { useAuth } from '@/context/AuthContext';
import { Target } from 'lucide-react';

export default function BrandMatchmakerPage() {
  const { user } = useAuth();
  const { 
    findBrandMatches, 
    isMatching, 
    creatorProfile, 
    isLoadingProfile 
  } = useBrandMatchmaker();
  
  const [activeTab, setActiveTab] = useState("find");
  const [matchResults, setMatchResults] = useState<BrandMatchResult[]>([]);
  
  const handleFindMatches = (request: BrandMatchRequest) => {
    findBrandMatches(request, {
      onSuccess: (data) => {
        setMatchResults(data);
        setActiveTab("results");
      }
    });
  };

  const handleContactBrand = (brandId: string) => {
    // Navigate to messaging with this brand selected
    window.location.href = `/messaging?brandId=${brandId}`;
  };

  if (!user?.id) {
    return (
      <div className="container py-8 text-center">
        <p className="text-lg">Please log in to use the Brand Matchmaker.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Target className="mr-3 h-8 w-8 text-primary" />
          AI Brand Matchmaker
        </h1>
        <p className="text-muted-foreground mt-2">
          Find brands that match your creator profile for profitable partnerships
        </p>
      </div>
      
      <Tabs defaultValue="find" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="find">Find Matches</TabsTrigger>
            <TabsTrigger value="results" disabled={matchResults.length === 0}>Match Results</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="find">
          <div className="grid gap-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Find Matching Brands</h2>
                <p className="text-muted-foreground mb-6">
                  Our AI analyzes your creator profile and finds the best brand matches based on your audience,
                  engagement metrics, and content style.
                </p>
                <MatchmakerForm 
                  onFindMatches={handleFindMatches} 
                  isLoading={isMatching || isLoadingProfile}
                  creatorId={user.id}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold">Your Brand Matches</h2>
            <MatchResults 
              results={matchResults}
              isLoading={isMatching}
              onContactBrand={handleContactBrand}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
