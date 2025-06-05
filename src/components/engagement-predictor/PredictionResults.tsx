
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Heart, MessageCircle, Share2, Clock } from 'lucide-react';
import { EngagementPredictionResult } from '@/types/engagement';

interface PredictionResultsProps {
  prediction: EngagementPredictionResult | null;
  isLoading?: boolean;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  prediction,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No prediction yet</p>
        <p className="text-sm">Fill out the form to get engagement predictions</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const overallScore = prediction.overall_score || prediction.overallScore || 75;

  const getMetricValue = (metric: any): number => {
    if (typeof metric === 'number') return metric;
    if (metric && typeof metric.estimatedCount === 'number') return metric.estimatedCount;
    return 0;
  };

  const getMetricConfidence = (metric: any): number => {
    if (typeof metric === 'number') return 0.75;
    if (metric && typeof metric.confidence === 'number') return metric.confidence;
    return 0.75;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Engagement Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold">
              {Math.round(overallScore)}%
            </span>
            <Badge
              variant="outline"
              className={getScoreColor(overallScore)}
            >
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
          <Progress 
            value={overallScore} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Likes</p>
                <p className="text-lg font-semibold">
                  {getMetricValue(prediction.metrics.likes).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(getMetricConfidence(prediction.metrics.likes) * 100)}% confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Comments</p>
                <p className="text-lg font-semibold">
                  {getMetricValue(prediction.metrics.comments).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(getMetricConfidence(prediction.metrics.comments) * 100)}% confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Shares</p>
                <p className="text-lg font-semibold">
                  {getMetricValue(prediction.metrics.shares).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(getMetricConfidence(prediction.metrics.shares) * 100)}% confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {prediction.insights && prediction.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prediction.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Times */}
      {(prediction.recommended_times || prediction.recommendedTimes) && 
       (prediction.recommended_times?.length > 0 || prediction.recommendedTimes?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recommended Posting Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(prediction.recommended_times || prediction.recommendedTimes)?.map((time, index) => (
                <Badge key={index} variant="secondary">
                  {time}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionResults;
