
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, DollarSign, Users, ExternalLink } from 'lucide-react';
import { BrandMatchResult } from '@/types/brandMatchmaking';

interface MatchResultsProps {
  matches: BrandMatchResult[];
}

export const MatchResults: React.FC<MatchResultsProps> = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No matches found</p>
        <p className="text-sm">Try adjusting your criteria to find more matches</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Brand Matches Found</h3>
        <p className="text-muted-foreground">
          Found {matches.length} potential brand partnerships
        </p>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {match.logo && (
                    <img
                      src={match.logo}
                      alt={match.brandName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-xl">{match.brandName}</CardTitle>
                    <p className="text-muted-foreground">{match.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{match.matchScore}/10</span>
                  </div>
                  <Badge variant="secondary">
                    {match.matchScore >= 8 ? 'Excellent' : match.matchScore >= 6 ? 'Good' : 'Fair'} Match
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{match.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{match.budget_range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">CPM: ${match.estimatedMetrics.cpm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">ROI: {match.estimatedMetrics.roi}%</span>
                </div>
              </div>

              {match.requirements && match.requirements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-1">
                    {match.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {match.compatibility_reasons && match.compatibility_reasons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Why it's a good match:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {match.compatibility_reasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Contact: {match.contact_email}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Save Match
                  </Button>
                  <Button size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Brand
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MatchResults;
