
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SavedCaption } from "@/types/caption";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Copy, Clock, Bookmark } from "lucide-react";
import { useState } from "react";

interface SavedCaptionsProps {
  captions: SavedCaption[] | undefined;
  isLoading: boolean;
}

export function SavedCaptions({ captions, isLoading }: SavedCaptionsProps) {
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  
  const handleCopy = (caption: string | null, id: string) => {
    if (!caption) return;
    
    navigator.clipboard.writeText(caption);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  if (!captions || captions.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-3 text-lg font-medium">No saved captions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate some captions and save your favorites to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-3">
          {captions.map((caption) => (
            <Card key={caption.id} className="group transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    <span className="capitalize">{caption.platform}</span> {caption.post_type}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(caption.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <CardDescription className="text-xs">
                  {caption.description.length > 120 
                    ? `${caption.description.slice(0, 120)}...` 
                    : caption.description}
                </CardDescription>
              </CardHeader>
              
              {caption.selected_caption && (
                <CardContent className="py-0">
                  <div className="text-xs border-l-2 border-primary pl-2 py-1 italic bg-primary/5">
                    {caption.selected_caption.length > 100
                      ? `${caption.selected_caption.slice(0, 100)}...`
                      : caption.selected_caption}
                  </div>
                </CardContent>
              )}
              
              <CardFooter className="pt-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(caption.selected_caption, caption.id)}
                  disabled={!caption.selected_caption || copiedCaptionId === caption.id}
                  className="text-xs"
                >
                  {copiedCaptionId === caption.id ? (
                    'Copied!'
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs transition-opacity">
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
