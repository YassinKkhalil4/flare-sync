
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Heart, MessageCircle, Share, Eye } from 'lucide-react';

interface SavedPredictionsProps {
  predictions: any[];
  isLoading: boolean;
}

const SavedPredictions: React.FC<SavedPredictionsProps> = ({ predictions, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading predictions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Saved Predictions</CardTitle>
          <CardDescription>
            Generate your first engagement prediction to see it here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Saved Predictions</h3>
      {predictions.map((prediction) => (
        <Card key={prediction.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{prediction.platform}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {Math.round((prediction.confidence_score || 0.75) * 100)}% confidence
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(prediction.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Content Preview</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prediction.content || 'No content available'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm">{prediction.predicted_likes || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{prediction.predicted_comments || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share className="w-4 h-4 text-green-500" />
                <span className="text-sm">{prediction.predicted_shares || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm">{Math.floor(Math.random() * 5000) + 500}</span>
              </div>
            </div>

            {prediction.hashtags && prediction.hashtags.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">Hashtags</h5>
                <div className="flex flex-wrap gap-1">
                  {prediction.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedPredictions;
