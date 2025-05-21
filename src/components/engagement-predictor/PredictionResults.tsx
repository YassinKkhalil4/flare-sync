
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EngagementPrediction, EngagementPredictionResult } from '@/types/engagement';
import { 
  BarChart, BarChart2, ThumbsUp, MessageCircle, 
  Share2, Bookmark, Clock, ArrowUpRight, 
  ArrowDownRight, LineChart, AlertCircle
} from 'lucide-react';

interface PredictionResultsProps {
  prediction: EngagementPredictionResult | null;
  isLoading: boolean;
}

export function PredictionResults({ prediction, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        
        <Skeleton className="h-24 w-full mt-4" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <BarChart2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No prediction yet</h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form and run a prediction to see the results
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.7) return "default";
    if (confidence >= 0.4) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-2">
          <h2 className="text-3xl font-bold">
            {prediction.overallScore}
          </h2>
          <p className="text-sm text-muted-foreground mb-1">/100</p>
        </div>
        
        <Badge variant="outline" className="flex items-center">
          <BarChart className="h-3 w-3 mr-1" />
          Engagement Score
        </Badge>
      </div>
      
      <Progress 
        value={prediction.overallScore} 
        className={`h-2 ${prediction.overallScore >= 80 ? 'bg-green-500' : 
          prediction.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
      />
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col items-center p-3 bg-muted/40 rounded-lg">
          <ThumbsUp className="h-5 w-5 mb-1 text-blue-500" />
          <span className="text-xl font-semibold">
            {prediction.metrics.likes.estimatedCount}
          </span>
          <span className="text-xs text-muted-foreground">
            Est. Likes
          </span>
          <Badge 
            variant={getConfidenceBadge(prediction.metrics.likes.confidence)}
            className="mt-1 text-xs"
          >
            {Math.round(prediction.metrics.likes.confidence * 100)}% confident
          </Badge>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-muted/40 rounded-lg">
          <MessageCircle className="h-5 w-5 mb-1 text-purple-500" />
          <span className="text-xl font-semibold">
            {prediction.metrics.comments.estimatedCount}
          </span>
          <span className="text-xs text-muted-foreground">
            Est. Comments
          </span>
          <Badge 
            variant={getConfidenceBadge(prediction.metrics.comments.confidence)}
            className="mt-1 text-xs"
          >
            {Math.round(prediction.metrics.comments.confidence * 100)}% confident
          </Badge>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-muted/40 rounded-lg">
          <Share2 className="h-5 w-5 mb-1 text-green-500" />
          <span className="text-xl font-semibold">
            {prediction.metrics.shares.estimatedCount}
          </span>
          <span className="text-xs text-muted-foreground">
            Est. Shares
          </span>
          <Badge 
            variant={getConfidenceBadge(prediction.metrics.shares.confidence)}
            className="mt-1 text-xs"
          >
            {Math.round(prediction.metrics.shares.confidence * 100)}% confident
          </Badge>
        </div>
      </div>
      
      <Card className="mt-4">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium flex items-center mb-2">
            <LineChart className="h-4 w-4 mr-1.5 text-primary" />
            Engagement Insights
          </h3>
          <ul className="space-y-2">
            {prediction.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                </div>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          
          {prediction.recommendedTimes && prediction.recommendedTimes.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Clock className="h-4 w-4 mr-1.5 text-primary" />
                Recommended Posting Times
              </h3>
              <div className="flex flex-wrap gap-2">
                {prediction.recommendedTimes.map((time, index) => (
                  <Badge key={index} variant="outline" className="flex items-center">
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
