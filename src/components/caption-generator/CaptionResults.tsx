
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CaptionResultsProps {
  captions: string[];
  captionId?: string;
  onSaveCaption: (captionId: string, selectedCaption: string) => Promise<boolean>;
  isSaving?: boolean;
}

export const CaptionResults: React.FC<CaptionResultsProps> = ({
  captions,
  captionId = '',
  onSaveCaption,
  isSaving = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: 'Copied!',
        description: 'Caption copied to clipboard',
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy caption to clipboard',
        variant: 'destructive',
      });
    }
  };

  const saveCaption = async (caption: string, index: number) => {
    try {
      const success = await onSaveCaption(captionId, caption);
      if (success) {
        setSavedIndex(index);
        toast({
          title: 'Caption saved!',
          description: 'Caption has been saved to your library',
        });
        setTimeout(() => setSavedIndex(null), 2000);
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save caption',
        variant: 'destructive',
      });
    }
  };

  const getEngagementScore = (caption: string) => {
    // Simple scoring based on caption characteristics
    let score = 60;
    if (caption.includes('#')) score += 15;
    if (caption.includes('?')) score += 10;
    if (caption.includes('!')) score += 5;
    if (caption.length > 100 && caption.length < 300) score += 10;
    return Math.min(95, score);
  };

  if (!captions || captions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No captions generated yet</p>
        <p className="text-sm">Fill out the form to generate AI captions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Generated Captions</h3>
        <p className="text-muted-foreground">Choose your favorite and copy or save it</p>
      </div>

      {captions.map((caption, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Caption {index + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getEngagementScore(caption)}% Score
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Heart className="h-3 w-3" />
                  <MessageCircle className="h-3 w-3" />
                  <Share2 className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {caption}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(caption, index)}
                className="flex-1"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button
                variant={savedIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => saveCaption(caption, index)}
                className="flex-1"
                disabled={isSaving}
              >
                {savedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save to Library'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CaptionResults;
