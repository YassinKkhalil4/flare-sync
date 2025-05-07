
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementPredictionResult } from "@/types/engagement";
import { BarChart, Brain, TrendingUp, Clock } from "lucide-react";

interface PredictionResultsProps {
  prediction: EngagementPredictionResult | null;
  isLoading: boolean;
}

export function PredictionResults({ prediction, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[60px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Brain className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Prediction Yet</h3>
          <p className="text-sm text-center text-muted-foreground max-w-md">
            Fill out the form to get AI-powered engagement predictions for your content.
            Our algorithms analyze your caption, timing, and content type to estimate performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Overall Engagement Score
          </CardTitle>
          <CardDescription>
            How well this content is expected to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{prediction.overallScore}</span>
              </div>
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(prediction.overallScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className={`${
                    prediction.overallScore > 80
                      ? "text-green-500"
                      : prediction.overallScore > 60
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
              </svg>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {prediction.overallScore > 80
                ? "Excellent! This content should perform very well."
                : prediction.overallScore > 60
                ? "Good performance expected. Could be improved further."
                : "Below average performance. Consider revising."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Estimated Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Likes</span>
                  <span className="font-medium">{prediction.metrics.likes.estimatedCount}</span>
                </div>
                <Progress value={prediction.metrics.likes.confidence * 100} />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Comments</span>
                  <span className="font-medium">{prediction.metrics.comments.estimatedCount}</span>
                </div>
                <Progress value={prediction.metrics.comments.confidence * 100} />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Shares</span>
                  <span className="font-medium">{prediction.metrics.shares.estimatedCount}</span>
                </div>
                <Progress value={prediction.metrics.shares.confidence * 100} />
              </div>
              
              {prediction.metrics.saves && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Saves</span>
                    <span className="font-medium">{prediction.metrics.saves.estimatedCount}</span>
                  </div>
                  <Progress value={prediction.metrics.saves.confidence * 100} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {prediction.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {prediction.recommendedTimes && prediction.recommendedTimes.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Better Posting Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {prediction.recommendedTimes.map((time, index) => (
                    <li key={index}>{time}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
