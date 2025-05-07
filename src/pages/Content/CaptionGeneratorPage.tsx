
import { useState } from "react";
import { CaptionForm } from "@/components/caption-generator/CaptionForm";
import { CaptionResults } from "@/components/caption-generator/CaptionResults";
import { SavedCaptions } from "@/components/caption-generator/SavedCaptions";
import { useCaptionGenerator } from "@/hooks/useCaptionGenerator";
import { CaptionGenerationRequest } from "@/types/caption";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CaptionGeneratorPage() {
  const { generateCaptions, isGenerating, savedCaptions, isLoadingSavedCaptions, saveSelectedCaption } = useCaptionGenerator();
  const [activeTab, setActiveTab] = useState("generate");
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [currentCaptionId, setCurrentCaptionId] = useState<string | null>(null);
  
  const handleFormSubmit = (values: CaptionGenerationRequest) => {
    generateCaptions(values, {
      onSuccess: (data) => {
        if (data.success && data.captions) {
          setGeneratedCaptions(data.captions);
          setCurrentCaptionId(data.captionId);
        }
      }
    });
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Caption Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create platform-optimized captions for your social media content using AI
        </p>
      </div>
      
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate">Generate Captions</TabsTrigger>
            <TabsTrigger value="saved">Saved Captions</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="generate" className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Captions</h2>
              <div className="bg-card p-6 rounded-lg border">
                <CaptionForm onSubmit={handleFormSubmit} isLoading={isGenerating} />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="bg-card p-6 rounded-lg border min-h-[300px]">
                <CaptionResults 
                  captions={generatedCaptions}
                  isLoading={isGenerating}
                  captionId={currentCaptionId}
                  onSaveCaption={saveSelectedCaption}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Your Saved Captions</h2>
            <SavedCaptions captions={savedCaptions} isLoading={isLoadingSavedCaptions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
