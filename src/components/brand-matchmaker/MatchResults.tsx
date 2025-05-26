
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
          <Card key={i} className="animate-pulse w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-full sm:w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full sm:w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full sm:w-2/3"></div>
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
      <Card className="text-center py-8 sm:py-12 w-full">
        <CardContent>
          <Building className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
            Try adjusting your preferences to find more brand opportunities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {results.map((result) => (
        <Card key={result.brandId} className="overflow-hidden hover:shadow-lg transition-shadow w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl break-words">{result.brandName}</CardTitle>
                  <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 flex-shrink-0" />
                      <span className="text-sm font-medium">{result.matchScore}% Match</span>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      High Compatibility
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => onContactBrand(result.brandId)} 
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Brand
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Match Reasons */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                Why This Is a Great Match
              </h4>
              <div className="space-y-2">
                {result.reasonForMatch.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Metrics */}
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <DollarSign className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                Estimated Performance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary">${result.estimatedMetrics.cpm}</p>
                  <p className="text-xs text-muted-foreground">Cost Per Mille</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{result.estimatedMetrics.ctr}%</p>
                  <p className="text-xs text-muted-foreground">Click-Through Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{result.estimatedMetrics.roi}%</p>
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
