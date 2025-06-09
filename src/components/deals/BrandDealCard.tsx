
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BrandDeal {
  id: string;
  brand_name: string;
  brand_logo?: string;
  title: string;
  description?: string;
  budget: number;
  deadline?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements?: string[];
  deliverables?: string[];
  created_at: string;
}

interface BrandDealCardProps {
  deal: BrandDeal;
  onAccept?: (dealId: string) => void;
  onReject?: (dealId: string) => void;
  onViewDetails?: (dealId: string) => void;
  isCreator?: boolean;
}

export const BrandDealCard: React.FC<BrandDealCardProps> = ({
  deal,
  onAccept,
  onReject,
  onViewDetails,
  isCreator = true
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {deal.brand_logo ? (
              <img 
                src={deal.brand_logo} 
                alt={deal.brand_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{deal.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{deal.brand_name}</p>
            </div>
          </div>
          {getStatusBadge(deal.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold">${deal.budget.toLocaleString()}</span>
          </div>
          {deal.deadline && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Due {format(new Date(deal.deadline), 'MMM dd')}</span>
            </div>
          )}
        </div>

        {deal.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {deal.description}
          </p>
        )}

        {deal.requirements && deal.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Requirements:</h4>
            <div className="flex flex-wrap gap-1">
              {deal.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {deal.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{deal.requirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isCreator && deal.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onAccept?.(deal.id)}
                className="flex-1"
              >
                Accept Deal
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onReject?.(deal.id)}
              >
                Decline
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onViewDetails?.(deal.id)}
            className={isCreator && deal.status === 'pending' ? 'w-auto' : 'flex-1'}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
