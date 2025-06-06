
import React, { useState } from 'react';
import { useCaptionGenerator } from '@/hooks/useCaptionGenerator';
import CaptionForm from '@/components/caption-generator/CaptionForm';
import CaptionResults from '@/components/caption-generator/CaptionResults';
import SavedCaptions from '@/components/caption-generator/SavedCaptions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaptionRequest } from '@/types/caption';

const CaptionGeneratorPage: React.FC = () => {
  const {
    generateCaptions,
    saveCaption,
    deleteCaption,
    captions,
    savedCaptions,
    isGenerating,
    isLoading
  } = useCaptionGenerator();

  const [currentCaptions, setCurrentCaptions] = useState<string[]>([]);

  const handleGenerateCaptions = async (request: CaptionRequest) => {
    try {
      const result = await generateCaptions(request);
      if (result && result.captions) {
        setCurrentCaptions(result.captions);
      }
    } catch (error) {
      console.error('Error generating captions:', error);
    }
  };

  const handleSaveCaption = async (caption: string, platform: string) => {
    try {
      await saveCaption({ caption, platform });
    } catch (error) {
      console.error('Error saving caption:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Caption Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate engaging captions for your social media posts using AI
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">Generate</TabsTrigger>
          <TabsTrigger value="saved">Saved Captions</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CaptionForm
              onSubmit={handleGenerateCaptions}
              isGenerating={isGenerating}
            />
            
            {currentCaptions.length > 0 && (
              <CaptionResults
                captions={currentCaptions}
                onSaveCaption={handleSaveCaption}
                isSaving={false}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <SavedCaptions
            captions={savedCaptions || []}
            onDeleteCaption={deleteCaption}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaptionGeneratorPage;
