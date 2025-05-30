
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaptionForm } from '@/components/caption-generator/CaptionForm';
import { CaptionResults } from '@/components/caption-generator/CaptionResults';
import { SavedCaptions } from '@/components/caption-generator/SavedCaptions';
import { Sparkles, History, Wand2 } from 'lucide-react';
import { Caption } from '@/types/caption';

export const CaptionGeneratorPage: React.FC = () => {
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [captionId, setCaptionId] = useState<string>('');
  const [savedCaptions, setSavedCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCaptionsGenerated = (captions: string[], id: string) => {
    setGeneratedCaptions(captions);
    setCaptionId(id);
  };

  const handleSaveCaption = async (captionId: string, selectedCaption: string): Promise<boolean> => {
    try {
      // Here you would typically save to backend
      console.log('Saving caption:', { captionId, selectedCaption });
      return true;
    } catch (error) {
      console.error('Error saving caption:', error);
      return false;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Caption Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate engaging captions for your social media posts using AI. 
          Customize tone, style, and platform-specific requirements.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Captions</CardTitle>
            </CardHeader>
            <CardContent>
              <CaptionForm 
                onGenerateCaptions={(request) => {
                  setIsGenerating(true);
                  // Simulate API call
                  setTimeout(() => {
                    const mockCaptions = [
                      "✨ Ready to transform your day? Let's make magic happen! #motivation #transformation",
                      "🔥 This is your reminder that you're absolutely unstoppable! What's your next move? #mindset #goals",
                      "💫 Small steps, big dreams. Every journey starts with a single moment of courage. #inspiration #journey"
                    ];
                    handleCaptionsGenerated(mockCaptions, Date.now().toString());
                    setIsGenerating(false);
                  }, 2000);
                }}
                isSubmitting={isGenerating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <CaptionResults 
            captions={generatedCaptions}
            captionId={captionId}
            onSaveCaption={handleSaveCaption}
          />
        </TabsContent>

        <TabsContent value="saved">
          <SavedCaptions 
            captions={savedCaptions}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptionGeneratorPage;
