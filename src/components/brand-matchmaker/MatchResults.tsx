
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BrandMatchResult } from "@/types/brandMatchmaking";
import { Check, DollarSign, MessageSquare, Target } from "lucide-react";

interface MatchResultsProps {
  results: BrandMatchResult[] | undefined;
  isLoading: boolean;
  onContactBrand?: (brandId: string) => void;
}

export function MatchResults({ results, isLoading, onContactBrand }: MatchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <Target className="h-16 w-16 mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
            <p className="text-sm text-center text-muted-foreground max-w-md">
              Try adjusting your search filters or complete your creator profile 
              with more details to improve match quality.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((match) => (
        <Card key={match.brandId} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                {match.brandName}
              </CardTitle>
              <div className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
                <span className="font-bold">{match.matchScore}%</span>
                <span className="ml-1 text-sm">match</span>
              </div>
            </div>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {match.reasonForMatch.map((reason, idx) => (
                  <div 
                    key={idx} 
                    className="bg-muted text-xs rounded-full px-2 py-1 flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                    {reason}
                  </div>
                ))}
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Estimated CPM</div>
                <div className="font-bold flex items-center">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  ${match.estimatedMetrics.cpm.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Est. CTR</div>
                <div className="font-bold">{(match.estimatedMetrics.ctr * 100).toFixed(2)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Est. ROI</div>
                <div className="font-bold">{match.estimatedMetrics.roi.toFixed(1)}x</div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="w-full">
              <Button 
                onClick={() => onContactBrand && onContactBrand(match.brandId)}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Brand
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
