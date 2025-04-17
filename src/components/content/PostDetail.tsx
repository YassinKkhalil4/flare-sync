
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { ContentPost } from '@/types/content';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Calendar,
  Clock,
  Edit2,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PostDetailProps {
  post: ContentPost;
}

const statusColor = (status: string) => {
  switch(status) {
    case 'draft': return 'bg-gray-500';
    case 'pending_approval': return 'bg-yellow-500';
    case 'scheduled': return 'bg-blue-500';
    case 'published': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const statusLabel = (status: string) => {
  switch(status) {
    case 'pending_approval': return 'In Review';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
  const navigate = useNavigate();
  
  const { data: approvals = [] } = useQuery({
    queryKey: ['post-approvals', post.id],
    queryFn: () => ContentService.getPostApprovals(post.id),
    enabled: post.status === 'pending_approval',
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate('/content')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        
        <Button 
          onClick={() => navigate(`/content/edit/${post.id}`)}
          variant="outline"
          className="flex items-center"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Post
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge className={`${statusColor(post.status)} text-white`}>
              {statusLabel(post.status)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {post.platform}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {post.body ? (
              <div className="whitespace-pre-wrap">
                {post.body}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No content</p>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              {post.scheduled_for && (
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled For</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(post.scheduled_for), "PPP")}
                    </span>
                  </div>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {post.tags.map(tag => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {post.status === 'pending_approval' && approvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {approvals.map(approval => (
                  <div key={approval.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                        {approval.profiles?.username?.[0].toUpperCase() || 'U'}
                      </div>
                      <span className="ml-2">{approval.profiles?.username || 'User'}</span>
                    </div>
                    <div>
                      {approval.status === 'pending' && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {approval.status === 'approved' && (
                        <Badge className="bg-green-500 text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {approval.status === 'rejected' && (
                        <Badge className="bg-red-500 text-white">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {post.reviewer_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Reviewer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{post.reviewer_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
