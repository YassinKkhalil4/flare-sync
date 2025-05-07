
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementPrediction } from "@/types/engagement";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, BarChart, Clock } from "lucide-react";

interface SavedPredictionsProps {
  predictions: EngagementPrediction[] | undefined;
  isLoading: boolean;
}

export function SavedPredictions({ predictions, isLoading }: SavedPredictionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  if (!predictions || predictions.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <BarChart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-3 text-lg font-medium">No saved predictions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate engagement predictions to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-3">
          {predictions.map((prediction) => (
            <Card key={prediction.id} className="group transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    <span className="capitalize">{prediction.platform}</span> {prediction.post_type}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <CardDescription className="text-xs">
                  {prediction.caption.length > 80
                    ? `${prediction.caption.slice(0, 80)}...`
                    : prediction.caption}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Engagement Score</div>
                    <div className="text-lg font-semibold">{prediction.overall_score}</div>
                  </div>
                  
                  <div className="flex space-x-3 text-xs">
                    <div className="text-center">
                      <div className="font-medium">{prediction.metrics.likes.estimated_count}</div>
                      <div className="text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{prediction.metrics.comments.estimated_count}</div>
                      <div className="text-muted-foreground">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{prediction.metrics.shares.estimated_count}</div>
                      <div className="text-muted-foreground">Shares</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-end">
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs transition-opacity">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
