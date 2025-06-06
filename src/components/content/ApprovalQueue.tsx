
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ContentApproval {
  id: string;
  post_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
  updated_at: string;
  post_title: string;
  post_body: string;
  post_platform: string;
  post_media_urls?: string[];
  post_created_at: string;
}

const ApprovalQueue: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['content-approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('content_approvals')
        .select(`
          *,
          post_title:content_posts(title),
          post_body:content_posts(body),
          post_platform:content_posts(platform),
          post_media_urls:content_posts(media_urls),
          post_created_at:content_posts(created_at)
        `)
        .eq('approver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to flatten the nested post information
      return (data || []).map(approval => ({
        ...approval,
        post_title: approval.post_title?.[0]?.title || 'Untitled Post',
        post_body: approval.post_body?.[0]?.body || '',
        post_platform: approval.post_platform?.[0]?.platform || '',
        post_media_urls: approval.post_media_urls?.[0]?.media_urls || [],
        post_created_at: approval.post_created_at?.[0]?.created_at || approval.created_at,
      })) as ContentApproval[];
    },
    enabled: !!user?.id,
  });

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ 
      approvalId, 
      status, 
      feedback 
    }: { 
      approvalId: string; 
      status: 'approved' | 'rejected'; 
      feedback?: string;
    }) => {
      const { error } = await supabase
        .from('content_approvals')
        .update({ 
          status, 
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-approvals'] });
      toast({
        title: 'Success',
        description: 'Approval status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update approval status',
        variant: 'destructive',
      });
    },
  });

  const handleApproval = (approvalId: string, status: 'approved' | 'rejected', feedback?: string) => {
    updateApprovalMutation.mutate({ approvalId, status, feedback });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading approval queue...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingApprovals = approvals.filter(approval => approval.status === 'pending');
  const completedApprovals = approvals.filter(approval => approval.status !== 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{approval.post_title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {approval.post_body}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{approval.post_platform}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Submitted {format(new Date(approval.created_at), 'PPp')}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(approval.status)}
                  </div>

                  {approval.post_media_urls && approval.post_media_urls.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      📎 {approval.post_media_urls.length} media file(s) attached
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleApproval(approval.id, 'approved')}
                      disabled={updateApprovalMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproval(approval.id, 'rejected', 'Content needs revision')}
                      disabled={updateApprovalMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Add Feedback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Decisions ({completedApprovals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {completedApprovals.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No completed approvals yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedApprovals.slice(0, 5).map((approval) => (
                <div key={approval.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{approval.post_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(approval.updated_at), 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{approval.post_platform}</Badge>
                    {getStatusBadge(approval.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalQueue;
