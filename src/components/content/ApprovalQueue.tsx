import React, { useState, useEffect } from 'react';
import { ContentAPI } from '@/services/contentService';
import { ContentApproval } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import PostDetail from './PostDetail';

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

const ApprovalQueue: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<ContentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [selectedApproval, setSelectedApproval] = useState<ContentApproval | null>(null);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setIsLoading(true);
      try {
        const approvals = await ContentAPI.getPendingApprovals();
        setPendingApprovals(approvals);
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    setIsUpdating(prev => ({ ...prev, [approvalId]: true }));
    try {
      await ContentAPI.updateApproval(approvalId, 'approved');
      setPendingApprovals(prev => prev.filter(approval => approval.id !== approvalId));
    } catch (error) {
      console.error("Error approving post:", error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [approvalId]: false }));
    }
  };

  const handleReject = async (approvalId: string) => {
    setIsUpdating(prev => ({ ...prev, [approvalId]: true }));
    try {
      await ContentAPI.updateApproval(approvalId, 'rejected');
      setPendingApprovals(prev => prev.filter(approval => approval.id !== approvalId));
    } catch (error) {
      console.error("Error rejecting post:", error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [approvalId]: false }));
    }
  };

  const handleViewDetails = (approval: ContentApproval) => {
    setSelectedApproval(approval);
  };

  const handleCloseDetails = () => {
    setSelectedApproval(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Pending Approvals</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="text-center p-6 bg-muted rounded-md">
          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No pending approvals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{approval.content_posts?.title || "Untitled Post"}</span>
                  <Badge>{approval.content_posts?.platform || "unknown"}</Badge>
                </CardTitle>
                <CardDescription>
                  Submitted {formatRelativeDate(approval.created_at)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div dangerouslySetInnerHTML={{ __html: approval.content_posts?.body || "" }} />
                  
                  {approval.content_posts?.media_urls && approval.content_posts.media_urls.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Media:</p>
                      <div className="flex flex-wrap gap-2">
                        {approval.content_posts.media_urls.map((url, i) => (
                          <img 
                            key={i} 
                            src={url} 
                            alt={`Media ${i+1}`} 
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewDetails(approval)}
                  >
                    View Details
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      variant="destructive" 
                      disabled={isUpdating[approval.id]} 
                      onClick={() => handleReject(approval.id)}
                    >
                      {isUpdating[approval.id] ? 
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                        <X className="h-4 w-4 mr-2" />
                      }
                      Reject
                    </Button>
                    <Button 
                      variant="default" 
                      disabled={isUpdating[approval.id]} 
                      onClick={() => handleApprove(approval.id)}
                    >
                      {isUpdating[approval.id] ? 
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                        <Check className="h-4 w-4 mr-2" />
                      }
                      Approve
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Details Modal */}
      {selectedApproval && (
        <PostDetail postId={selectedApproval.post_id} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default ApprovalQueue;
