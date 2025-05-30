
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Save, ArrowDown, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CaptionResultsProps {
  captions: string[];
  captionId: string;
  onSaveCaption: (captionId: string, selectedCaption: string) => Promise<boolean>;
}

export const CaptionResults: React.FC<CaptionResultsProps> = ({ 
  captions, 
  captionId,
  onSaveCaption
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: 'Caption copied',
      description: 'Caption has been copied to clipboard',
    });
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSave = async () => {
    if (selectedIndex === null) {
      toast({
        title: 'No caption selected',
        description: 'Please select a caption to save',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSaveCaption(captionId, captions[selectedIndex]);
      if (success) {
        toast({
          title: 'Caption saved',
          description: 'Your selected caption has been saved',
        });
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      toast({
        title: 'Error saving caption',
        description: 'There was an error saving your caption',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!captions || captions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No captions generated yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Use the generate tab to create your first set of AI-powered captions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Generated Captions</h3>
          <p className="text-sm text-muted-foreground">
            {captions.length} caption{captions.length !== 1 ? 's' : ''} ready for you
          </p>
        </div>
        {selectedIndex !== null && (
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            {saving ? (
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Selected
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {captions.map((caption, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedIndex === index 
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5' 
                  : 'hover:border-primary/50 border-border'
              }`}
              onClick={() => handleSelect(index)}
            >
              <CardContent className="p-6 relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Caption {index + 1}
                      </span>
                      {selectedIndex === index && (
                        <span className="text-xs font-medium text-primary-foreground bg-primary px-2 py-1 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-sm">{caption}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex-shrink-0 h-9 w-9 p-0 hover:bg-muted" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(caption, index);
                    }}
                  >
                    {copied === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {captions.length > 4 && (
        <div className="flex justify-center pt-4">
          <Button variant="ghost" size="sm" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowDown className="h-3 w-3 mr-1" />
            Scroll to see more captions
          </Button>
        </div>
      )}
    </div>
  );
};
