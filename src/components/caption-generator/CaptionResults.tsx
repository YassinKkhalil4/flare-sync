
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Save, ArrowDown } from 'lucide-react';
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
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No captions generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Generated Captions</h3>
        {selectedIndex !== null && (
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center"
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
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {captions.map((caption, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all ${
                selectedIndex === index 
                  ? 'border-primary ring-1 ring-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(index)}
            >
              <CardContent className="p-4 relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="whitespace-pre-line">{caption}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-2 h-8 w-8 flex-shrink-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(caption, index);
                    }}
                  >
                    {copied === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {selectedIndex === index && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                      Selected
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {captions.length > 4 && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="flex items-center text-muted-foreground">
            <ArrowDown className="h-3 w-3 mr-1" />
            Scroll for more
          </Button>
        </div>
      )}
    </div>
  );
};
