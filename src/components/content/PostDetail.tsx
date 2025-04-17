import React, { useState, useEffect } from 'react';
import { ContentAPI } from '@/services/contentService';
import { ContentPost, ContentApproval, ContentStatus } from '@/types/content';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Loader2, Send, User } from 'lucide-react';

interface PostDetailProps {
  postId: string;
  onClose: () => void;
}

const ProfileDisplay: React.FC<{ avatarUrl?: string | null; name: string; timestamp: string }> = ({ avatarUrl, name, timestamp }) => (
  <div className="flex items-center space-x-3">
    <Avatar className="h-8 w-8">
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} />
      ) : (
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
    <div>
      <p className="text-sm font-medium leading-none">{name}</p>
      <p className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </p>
    </div>
  </div>
);

const PostDetail: React.FC<PostDetailProps> = ({ postId, onClose }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<ContentPost | null>(null);
  const [approvals, setApprovals] = useState<ContentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const fetchedPost = await ContentAPI.getPostById(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchApprovals = async () => {
      setIsLoadingApprovals(true);
      try {
        const fetchedApprovals = await ContentAPI.getPostApprovals(postId);
        setApprovals(fetchedApprovals);
      } catch (error) {
        console.error("Error fetching approvals:", error);
      } finally {
        setIsLoadingApprovals(false);
      }
    };

    fetchPost();
    fetchApprovals();
  }, [postId]);

  const handleRequestApproval = async () => {
    if (!user || !post) return;

    setIsSubmitting(true);
    try {
      // Optimistically update the UI
      setPost(prevPost => prevPost ? { ...prevPost, status: 'pending_approval' as ContentStatus } : null);

      // Call the Supabase function to create the approval request
      await supabase.functions.invoke('request-approval', {
        body: {
          postId: post.id,
          userId: user.id,
          notes: approvalNotes
        }
      });

      // Refresh approvals
      const fetchedApprovals = await ContentAPI.getPostApprovals(postId);
      setApprovals(fetchedApprovals);
    } catch (error) {
      console.error("Error requesting approval:", error);
      // Revert the UI on error
      setPost(prevPost => prevPost ? { ...prevPost, status: 'draft' as ContentStatus } : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update comparisons for ContentStatus
  const canRequestApproval = post && 
    (post.status === 'draft' || post.status === 'rejected') && 
    !isLoadingApprovals;
    
  const isAwaitingApproval = post?.status === 'pending_approval';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
        <CardDescription>
          View details and manage approvals for this content post
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : post ? (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-muted-foreground">
                Status: <Badge variant="secondary">{post.status}</Badge>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={post.body || ''} readOnly className="bg-muted" />
            </div>

            {post.media_urls && post.media_urls.length > 0 && (
              <div className="space-y-2">
                <Label>Media</Label>
                <div className="flex gap-2">
                  {post.media_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Approval History</h4>
              {isLoadingApprovals ? (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : approvals.length > 0 ? (
                <ScrollArea className="h-[200px] w-full rounded-md border">
                  <div className="p-4 space-y-4">
                    {approvals.map((approval) => (
                      <div key={approval.id} className="space-y-1">
                        <ProfileDisplay
                          avatarUrl={approval.profiles?.avatar_url}
                          name={approval.profiles?.full_name || approval.profiles?.username || "Unknown User"}
                          timestamp={approval.created_at}
                        />
                        <p className="text-sm text-muted-foreground ml-11">
                          {approval.notes}
                        </p>
                        <p className="text-sm ml-11">
                          Status: <Badge variant="secondary">{approval.status}</Badge>
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No approval history found.</p>
              )}
            </div>

            {canRequestApproval && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="approval-notes">Approval Notes</Label>
                  <Textarea
                    id="approval-notes"
                    placeholder="Add any notes for the approver"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                  <Button disabled={isSubmitting} onClick={handleRequestApproval}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Request Approval
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {isAwaitingApproval && (
              <>
                <Separator />
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Awaiting approval from reviewer.
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Post not found.</p>
          </div>
        )}
      </CardContent>
      {/* <CardFooter>
        <Button onClick={onClose}>Close</Button>
      </CardFooter> */}
    </Card>
  );
};

export default PostDetail;
