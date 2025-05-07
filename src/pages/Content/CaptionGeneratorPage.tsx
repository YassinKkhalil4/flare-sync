
import React, { useState } from 'react';
import { CaptionForm } from '@/components/caption-generator/CaptionForm';
import { CaptionResults } from '@/components/caption-generator/CaptionResults';
import { SavedCaptions } from '@/components/caption-generator/SavedCaptions';
import { useCaptionGenerator } from '@/hooks/useCaptionGenerator';
import { CaptionGenerationRequest, CaptionGenerationResponse } from '@/types/caption';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';

const CaptionGeneratorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [generationResult, setGenerationResult] = useState<CaptionGenerationResponse | null>(null);
  
  const { 
    generateCaptions,
    isGenerating,
    savedCaptions,
    isLoadingSavedCaptions,
    saveSelectedCaption
  } = useCaptionGenerator();

  const handleSubmit = async (values: CaptionGenerationRequest) => {
    try {
      generateCaptions(values, {
        onSuccess: (data) => {
          setGenerationResult(data);
          setActiveTab('results');
        }
      });
    } catch (error) {
      console.error('Error generating captions:', error);
    }
  };

  const handleSavedCaptionSelect = async (captionId: string, selectedCaption: string) => {
    await saveSelectedCaption(captionId, selectedCaption);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          AI Caption Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate engaging captions for your social media posts using AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="results" disabled={!generationResult}>Results</TabsTrigger>
          <TabsTrigger value="saved">Saved Captions</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Captions</CardTitle>
              <CardDescription>
                Fill in the details below to generate AI-powered captions for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaptionForm 
                isSubmitting={isGenerating}
                onGenerateCaptions={handleSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          {generationResult && (
            <CaptionResults 
              result={generationResult} 
              onSaveCaption={() => setActiveTab('saved')} 
            />
          )}
        </TabsContent>

        <TabsContent value="saved">
          <SavedCaptions 
            captions={savedCaptions || []} 
            isLoading={isLoadingSavedCaptions}
            onSelectCaption={handleSavedCaptionSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptionGeneratorPage;
