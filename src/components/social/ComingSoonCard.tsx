
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const ComingSoonCard: React.FC = () => {
  return (
    <Card className="opacity-50">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="rounded-full bg-blue-100 p-3">
          <AlertCircle className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <CardTitle>More Platforms Coming Soon</CardTitle>
          <CardDescription>
            We're working on adding more social media platforms
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Stay tuned for more platform integrations including TikTok, YouTube, and Twitter.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" disabled>Connect (Coming Soon)</Button>
      </CardFooter>
    </Card>
  );
};

export default ComingSoonCard;
