
import { useState } from "react";
import { PredictorForm } from "@/components/engagement-predictor/PredictorForm";
import { PredictionResults } from "@/components/engagement-predictor/PredictionResults";
import { SavedPredictions } from "@/components/engagement-predictor/SavedPredictions";
import { useEngagementPredictor } from "@/hooks/useEngagementPredictor";
import { EngagementPredictionRequest, EngagementPredictionResult } from "@/types/engagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EngagementPredictorPage() {
  const { 
    predictEngagement, 
    isPredicting, 
    savedPredictions, 
    isLoadingSavedPredictions 
  } = useEngagementPredictor();
  
  const [activeTab, setActiveTab] = useState("predict");
  const [currentPrediction, setCurrentPrediction] = useState<EngagementPredictionResult | null>(null);
  
  const handleFormSubmit = (values: EngagementPredictionRequest) => {
    predictEngagement(values, {
      onSuccess: (data) => {
        // Transform the data to match EngagementPredictionResult
        const result: EngagementPredictionResult = {
          ...data,
          overallScore: data.overall_score
        };
        setCurrentPrediction(result);
      }
    });
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Engagement Predictor</h1>
        <p className="text-muted-foreground mt-2">
          Use AI to predict how well your content will perform before posting
        </p>
      </div>
      
      <Tabs defaultValue="predict" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="predict">Predict Engagement</TabsTrigger>
            <TabsTrigger value="saved">Saved Predictions</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="predict" className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-4">Analyze Your Content</h2>
              <div className="bg-card p-6 rounded-lg border">
                <PredictorForm onSubmit={handleFormSubmit} isLoading={isPredicting} />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="bg-card p-6 rounded-lg border min-h-[300px]">
                <PredictionResults 
                  prediction={currentPrediction}
                  isLoading={isPredicting}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Your Saved Predictions</h2>
            <SavedPredictions predictions={savedPredictions || []} isLoading={isLoadingSavedPredictions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
