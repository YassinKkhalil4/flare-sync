
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { ContentApproval } from '@/types/content';
import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const ApprovalQueue: React.FC = () => {
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  
  const { 
    data: pendingApprovals = [] as ContentApproval[],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: ContentService.getPendingApprovals
  });
  
  const handleApprove = async (approval: ContentApproval) => {
    await ContentService.updateApproval(approval.id, 'approved', notes[approval.id]);
    refetch();
  };
  
  const handleReject = async (approval: ContentApproval) => {
    await ContentService.updateApproval(approval.id, 'rejected', notes[approval.id]);
    refetch();
  };
  
  const handleNotesChange = (approvalId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [approvalId]: value
    }));
  };
  
  if (isLoading) {
    return <div>Loading approval queue...</div>;
  }
  
  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            No posts pending approval
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Approval Queue</h2>
      
      <div className="grid gap-6">
        {pendingApprovals.map(approval => (
          <Card key={approval.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{approval.content_posts?.title || 'Untitled Post'}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(approval.created_at || Date.now()), { addSuffix: true })}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{approval.content_posts?.body || 'No content'}</p>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Add Review Notes</h4>
                <Textarea
                  placeholder="Add your review notes here..."
                  value={notes[approval.id] || ''}
                  onChange={(e) => handleNotesChange(approval.id, e.target.value)}
                  className="h-24"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => handleReject(approval)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleApprove(approval)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
