
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EngagementPrediction } from '@/services/aiService';
import { BarChart, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedPredictionsProps {
  predictions: EngagementPrediction[];
  isLoading: boolean;
}

export function SavedPredictions({ predictions, isLoading }: SavedPredictionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!predictions.length) {
    return (
      <div className="text-center py-12">
        <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No predictions yet</h3>
        <p className="text-muted-foreground">
          Generate your first engagement prediction to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <Card key={prediction.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{prediction.platform} Post</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Score: {prediction.overall_score}
                </Badge>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prediction.caption}
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {prediction.metrics.likes.estimatedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {prediction.metrics.comments.estimatedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {prediction.metrics.shares.estimatedCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Shares</div>
                </div>
              </div>

              {prediction.insights && prediction.insights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Top Insights:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {prediction.insights.slice(0, 2).map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
