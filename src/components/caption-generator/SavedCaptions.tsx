
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, History, Trash2 } from 'lucide-react';
import { SavedCaption } from '@/types/caption';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SavedCaptionsProps {
  captions: SavedCaption[];
  isLoading: boolean;
}

export const SavedCaptions: React.FC<SavedCaptionsProps> = ({
  captions,
  isLoading,
}) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Caption copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy caption to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!captions || captions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No saved captions yet</p>
        <p className="text-sm">Generate and save captions to build your library</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Saved Captions</h3>
        <Badge variant="secondary">{captions.length}</Badge>
      </div>

      {captions.map((caption) => (
        <Card key={caption.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {caption.platform}
                </Badge>
                {caption.tone && (
                  <Badge variant="secondary" className="capitalize">
                    {caption.tone}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(caption.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {caption.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Original Description:</p>
                <p className="text-sm bg-muted/30 rounded p-2">{caption.description}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Selected Caption:</p>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {caption.selected_caption || caption.captions[0]}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(caption.selected_caption || caption.captions[0])}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
