
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { PredictorForm } from '@/components/engagement-predictor/PredictorForm';
import { PredictionResults } from '@/components/engagement-predictor/PredictionResults';
import SavedPredictions from '@/components/engagement-predictor/SavedPredictions';
import { useEngagementPredictor } from '@/hooks/useEngagementPredictor';
import { EngagementPredictionResult, EngagementPredictionRequest } from '@/types/engagement';

const EngagementPredictorPage = () => {
  const [prediction, setPrediction] = useState<EngagementPredictionResult | null>(null);
  const { predict, isLoading, savedPredictions, isLoadingPredictions } = useEngagementPredictor();

  const handlePredict = async (data: EngagementPredictionRequest) => {
    try {
      const result = await predict({
        content: data.content || data.caption || '',
        platform: data.platform,
        hashtags: data.hashtags,
        mediaUrls: data.mediaUrls,
      });
      
      // Transform the result to match the expected format
      const transformedResult: EngagementPredictionResult = {
        id: `pred_${Date.now()}`,
        platform: data.platform,
        content: data.content || data.caption || '',
        scheduled_time: data.scheduledTime || new Date().toISOString(),
        overall_score: Math.round(((result?.confidence_score || 0.75) * 100)),
        predicted_likes: result?.predicted_likes || 0,
        predicted_comments: result?.predicted_comments || 0,
        predicted_shares: result?.predicted_shares || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current-user',
        insights: [
          'High engagement expected during peak hours',
          'Hashtags show good trending potential',
          'Visual content performs well on this platform'
        ],
        metrics: {
          likes: {
            estimatedCount: result?.predicted_likes || 0,
            confidence: result?.confidence_score || 0.75
          },
          comments: {
            estimatedCount: result?.predicted_comments || 0,
            confidence: result?.confidence_score || 0.75
          },
          shares: {
            estimatedCount: result?.predicted_shares || 0,
            confidence: result?.confidence_score || 0.75
          }
        }
      };
      
      setPrediction(transformedResult);
    } catch (error) {
      console.error('Failed to predict engagement:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Predictor</h1>
          <p className="text-muted-foreground">
            Use AI to predict how your content will perform before posting
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <PredictorForm onPredict={handlePredict} isLoading={isLoading} />
            {prediction && <PredictionResults prediction={prediction} />}
          </div>
          
          <div>
            <SavedPredictions 
              predictions={savedPredictions} 
              isLoading={isLoadingPredictions}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EngagementPredictorPage;
