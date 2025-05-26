
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandMatchResult } from '@/types/brandMatchmaking';
import { Building, TrendingUp, DollarSign, MessageCircle, Star } from 'lucide-react';

interface MatchResultsProps {
  results: BrandMatchResult[];
  isLoading: boolean;
  onContactBrand: (brandId: string) => void;
}

export function MatchResults({ results, isLoading, onContactBrand }: MatchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your preferences to find more brand opportunities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Card key={result.brandId} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{result.brandName}</CardTitle>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{result.matchScore}% Match</span>
                    <Badge variant="secondary" className="ml-2">
                      High Compatibility
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => onContactBrand(result.brandId)} className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Brand
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Match Reasons */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Why This Is a Great Match
              </h4>
              <div className="space-y-2">
                {result.reasonForMatch.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Metrics */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Estimated Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">${result.estimatedMetrics.cpm}</p>
                  <p className="text-xs text-muted-foreground">Cost Per Mille</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.estimatedMetrics.ctr}%</p>
                  <p className="text-xs text-muted-foreground">Click-Through Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{result.estimatedMetrics.roi}%</p>
                  <p className="text-xs text-muted-foreground">Expected ROI</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
