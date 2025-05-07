
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

interface CaptionResultsProps {
  captions: string[];
  isLoading?: boolean;
  captionId?: string | null;
  onSaveCaption?: (captionId: string, caption: string) => Promise<boolean>;
}

export function CaptionResults({ captions, isLoading = false, captionId, onSaveCaption }: CaptionResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const handleCopy = (caption: string, index: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    toast({
      title: "Caption copied",
      description: "Caption has been copied to clipboard",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const handleSave = async (caption: string, index: number) => {
    if (!captionId || !onSaveCaption) return;
    
    try {
      setIsSaving(true);
      const success = await onSaveCaption(captionId, caption);
      if (success) {
        setSavedIndex(index);
        setTimeout(() => setSavedIndex(null), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (captions.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generated Captions
        </h3>
        <p className="text-sm text-muted-foreground">
          Select the caption that suits your content best. You can copy any caption or save it for later use.
        </p>
      </div>
      
      {captions.map((caption, index) => (
        <Card key={index} className={savedIndex === index ? "border-primary border-2" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Caption {index + 1}</CardTitle>
            {savedIndex === index && (
              <CardDescription className="text-primary flex items-center gap-1">
                <Check className="h-4 w-4" />
                Saved as preferred caption
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{caption}</div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end pt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCopy(caption, index)}
              disabled={copiedIndex === index}
            >
              {copiedIndex === index ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            
            {captionId && onSaveCaption && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSave(caption, index)}
                disabled={isSaving || savedIndex === index}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Saving...
                  </>
                ) : savedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  'Save as Preferred'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
