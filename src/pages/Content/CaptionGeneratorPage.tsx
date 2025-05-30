
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaptionForm } from '@/components/caption-generator/CaptionForm';
import { CaptionResults } from '@/components/caption-generator/CaptionResults';
import { SavedCaptions } from '@/components/caption-generator/SavedCaptions';
import { Sparkles, History, Wand2, Stars } from 'lucide-react';
import { SavedCaption } from '@/types/caption';

export const CaptionGeneratorPage: React.FC = () => {
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [captionId, setCaptionId] = useState<string>('');
  const [savedCaptions, setSavedCaptions] = useState<SavedCaption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCaptionsGenerated = (captions: string[], id: string) => {
    setGeneratedCaptions(captions);
    setCaptionId(id);
  };

  const handleSaveCaption = async (captionId: string, selectedCaption: string): Promise<boolean> => {
    try {
      console.log('Saving caption:', { captionId, selectedCaption });
      return true;
    } catch (error) {
      console.error('Error saving caption:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Stars className="h-10 w-10 text-primary animate-pulse" />
              <Sparkles className="h-6 w-6 text-secondary absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Caption Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create compelling, platform-optimized captions that engage your audience and boost your content performance with AI-powered creativity.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          <Tabs defaultValue="generate" className="w-full">
            <div className="border-b border-border/50 bg-muted/30">
              <TabsList className="grid w-full grid-cols-3 bg-transparent h-16 p-2">
                <TabsTrigger 
                  value="generate" 
                  className="flex items-center gap-3 h-12 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Captions
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className="flex items-center gap-3 h-12 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Generated Results
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="flex items-center gap-3 h-12 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <History className="h-4 w-4" />
                  Saved Captions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="generate" className="p-8 m-0">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Create New Captions</h2>
                  <p className="text-muted-foreground">Tell us about your content and we'll generate perfect captions</p>
                </div>
                <CaptionForm 
                  onGenerateCaptions={(request) => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      const mockCaptions = [
                        "✨ Ready to transform your day? Let's make magic happen! 🌟 What's one small change you're making today that'll create a big impact? Share below! 👇 #transformation #motivation #mindset #growth",
                        "🔥 This is your reminder that you're absolutely unstoppable! 💪 Every challenge is just another opportunity to show how strong you really are. What's your next bold move? #unstoppable #mindset #goals #strength",
                        "💫 Small steps, big dreams. Every journey starts with a single moment of courage. ✨ Today is that moment - what dream are you taking action on? #inspiration #journey #dreams #courage #action"
                      ];
                      handleCaptionsGenerated(mockCaptions, Date.now().toString());
                      setIsGenerating(false);
                    }, 2000);
                  }}
                  isSubmitting={isGenerating}
                />
              </div>
            </TabsContent>

            <TabsContent value="results" className="p-8 m-0">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Your Generated Captions</h2>
                  <p className="text-muted-foreground">Choose your favorite and save it for later use</p>
                </div>
                <CaptionResults 
                  captions={generatedCaptions}
                  captionId={captionId}
                  onSaveCaption={handleSaveCaption}
                />
              </div>
            </TabsContent>

            <TabsContent value="saved" className="p-8 m-0">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Your Caption Library</h2>
                  <p className="text-muted-foreground">Access all your saved captions in one place</p>
                </div>
                <SavedCaptions 
                  captions={savedCaptions}
                  isLoading={false}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CaptionGeneratorPage;
