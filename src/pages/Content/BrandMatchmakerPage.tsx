
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchmakerForm } from '@/components/brand-matchmaker/MatchmakerForm';
import { MatchResults } from '@/components/brand-matchmaker/MatchResults';
import { useBrandMatchmaker } from '@/hooks/useBrandMatchmaker';
import { BrandMatchRequest, BrandMatchResult } from '@/types/brandMatchmaking';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessagingAPI } from '@/services/messagingService';
import { Target, Sparkles, TrendingUp } from 'lucide-react';

export default function BrandMatchmakerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleContactBrand = async (brandId: string) => {
    try {
      // Find the brand name from results
      const brand = matchResults.find(result => result.brandId === brandId);
      const brandName = brand?.brandName || 'Brand';
      
      // Create conversation with the brand
      const conversationId = await MessagingAPI.createBrandConversation(brandId, brandName);
      
      toast({
        title: 'Conversation Started',
        description: `You can now message ${brandName}!`
      });
      
      // Navigate to messaging with the new conversation
      navigate(`/messaging?conversation=${conversationId}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start conversation with brand'
      });
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to use the Brand Matchmaker.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mb-4 sm:mb-0 sm:mr-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">AI Brand Matchmaker</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto px-4">
            Discover perfect brand partnerships powered by AI. Match with brands that align with your audience and maximize your earning potential.
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2 text-sm lg:text-base">AI-Powered Matching</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">Advanced algorithms analyze your profile to find the perfect brand matches</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2 text-sm lg:text-base">Revenue Optimization</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">Get estimated earnings and ROI predictions for each partnership</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2 text-sm lg:text-base">Perfect Alignment</h3>
              <p className="text-xs lg:text-sm text-muted-foreground">Match with brands that resonate with your audience and values</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Card className="border-0 shadow-lg w-full">
          <Tabs defaultValue="find" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-muted/30 px-4 sm:px-6 py-4 border-b">
              <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
                <TabsTrigger value="find" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Find Matches</span>
                  <span className="sm:hidden">Find</span>
                </TabsTrigger>
                <TabsTrigger value="results" disabled={matchResults.length === 0} className="flex items-center gap-2 text-xs sm:text-sm">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Results ({matchResults.length})</span>
                  <span className="sm:hidden">Results</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="find" className="p-4 sm:p-6">
              <div className="w-full max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Find Your Perfect Brand Matches</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Set your preferences and let our AI find brands that are the perfect fit for your creator profile and audience.
                  </p>
                </div>
                <MatchmakerForm 
                  onFindMatches={handleFindMatches} 
                  isLoading={isMatching || isLoadingProfile}
                  creatorId={user.id}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="p-4 sm:p-6">
              <div className="w-full">
                <div className="mb-6 text-center">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">Your Brand Matches</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    AI-curated partnerships designed to maximize your success
                  </p>
                </div>
                <MatchResults 
                  results={matchResults}
                  isLoading={isMatching}
                  onContactBrand={handleContactBrand}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
