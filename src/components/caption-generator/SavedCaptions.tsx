
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SavedCaption } from '@/types/caption';
import { Copy, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SavedCaptionsProps {
  captions: SavedCaption[];
  isLoading: boolean;
  onSelectCaption?: (captionId: string, selectedCaption: string) => Promise<boolean>;
}

export const SavedCaptions: React.FC<SavedCaptionsProps> = ({
  captions,
  isLoading,
  onSelectCaption,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Caption copied',
      description: 'Caption has been copied to clipboard',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!captions.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Copy className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No saved captions yet</h3>
          <p className="text-sm text-muted-foreground text-center">
            Generate and save captions to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {captions.map((caption) => (
          <Card key={caption.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge className="mr-2" variant="outline">
                    {caption.platform}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(caption.created_at), { addSuffix: true })}
                  </span>
                </div>
                <Badge variant={caption.selected_caption ? "default" : "outline"}>
                  {caption.selected_caption ? "Saved" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Post Description:</h4>
                <p className="text-sm text-muted-foreground">{caption.description}</p>
              </div>
              
              {caption.selected_caption ? (
                <div className="bg-muted p-3 rounded-md mb-2 relative">
                  <p className="text-sm whitespace-pre-line">{caption.selected_caption}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(caption.selected_caption!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">
                      Multiple captions available
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {caption.tone}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {caption.post_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {caption.objective}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
