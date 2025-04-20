
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Calendar, DollarSign } from 'lucide-react';

export interface BrandDeal {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  creator_id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements: string[];
  deliverables: string[];
  deadline: string;
  created_at: string;
}

interface BrandDealCardProps {
  deal: BrandDeal;
  userType: string;
  actionInProgress: boolean;
  onStatusUpdate: (dealId: string, status: 'accepted' | 'rejected' | 'completed') => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const BrandDealCard: React.FC<BrandDealCardProps> = ({
  deal,
  userType,
  actionInProgress,
  onStatusUpdate,
}) => (
  <Card className={`border ${deal.status === 'accepted' ? 'border-green-500' : ''}`}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <img
              src={deal.brand_logo}
              alt={deal.brand_name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <CardTitle>{deal.title}</CardTitle>
            <CardDescription>
              {userType === 'creator' ? `From ${deal.brand_name}` : 'For creators'}
            </CardDescription>
          </div>
        </div>

        <Badge
          className={`
            ${deal.status === 'pending' ? 'bg-yellow-500' : ''}
            ${deal.status === 'accepted' ? 'bg-green-500' : ''}
            ${deal.status === 'rejected' ? 'bg-red-500' : ''}
            ${deal.status === 'completed' ? 'bg-blue-500' : ''}
          `}
        >
          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>{deal.description}</p>
      <div className="flex flex-wrap gap-6">
        <div>
          <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
            <DollarSign className="h-4 w-4" /> Budget
          </h4>
          <p className="text-lg font-bold">{formatCurrency(deal.budget)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Deadline
          </h4>
          <p>{formatDate(deal.deadline)}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Requirements</h4>
          <ul className="list-disc pl-5 space-y-1">
            {deal.requirements.map((req, i) => (
              <li key={i} className="text-sm">{req}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Deliverables</h4>
          <ul className="list-disc pl-5 space-y-1">
            {deal.deliverables.map((deliv, i) => (
              <li key={i} className="text-sm">{deliv}</li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
    {userType === 'creator' && deal.status === 'pending' && (
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onStatusUpdate(deal.id, 'rejected')}
          disabled={actionInProgress}
        >
          {actionInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Decline
        </Button>
        <Button
          onClick={() => onStatusUpdate(deal.id, 'accepted')}
          disabled={actionInProgress}
        >
          {actionInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Accept
        </Button>
      </CardFooter>
    )}
    {userType === 'creator' && deal.status === 'accepted' && (
      <CardFooter>
        <Button
          onClick={() => onStatusUpdate(deal.id, 'completed')}
          disabled={actionInProgress}
          className="ml-auto"
        >
          {actionInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Mark as Completed
        </Button>
      </CardFooter>
    )}
  </Card>
);

