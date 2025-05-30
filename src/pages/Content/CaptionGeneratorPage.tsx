
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CaptionForm from '@/components/caption-generator/CaptionForm';
import CaptionResults from '@/components/caption-generator/CaptionResults';
import SavedCaptions from '@/components/caption-generator/SavedCaptions';
import { Sparkles, History, Wand2 } from 'lucide-react';
import { Caption } from '@/types/caption';

export const CaptionGeneratorPage: React.FC = () => {
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCaptionsGenerated = (captions: Caption[]) => {
    setGeneratedCaptions(captions);
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
                onCaptionsGenerated={handleCaptionsGenerated}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <CaptionResults 
            captions={generatedCaptions}
            isLoading={isGenerating}
          />
        </TabsContent>

        <TabsContent value="saved">
          <SavedCaptions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptionGeneratorPage;
