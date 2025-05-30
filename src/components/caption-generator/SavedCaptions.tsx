
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SavedCaption } from '@/types/caption';
import { Copy, ExternalLink, Archive, Calendar } from 'lucide-react';
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
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-20 w-full mb-3" />
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
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No saved captions yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Generate and save captions to build your personal library of engaging content
          </p>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Generate Your First Caption
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {captions.map((caption) => (
          <Card key={caption.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-medium">
                    {caption.platform}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(caption.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant={caption.selected_caption ? "default" : "secondary"}>
                  {caption.selected_caption ? "Saved" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Content Description:</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{caption.description}</p>
                </div>
                
                {caption.selected_caption ? (
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border border-primary/20 relative">
                    <p className="text-sm whitespace-pre-line leading-relaxed pr-8">{caption.selected_caption}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(caption.selected_caption!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Multiple captions available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
