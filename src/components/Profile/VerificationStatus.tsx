
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const VerificationStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>
          Verification increases your credibility with brands and can lead to better deals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Email Verification</h4>
                <p className="text-sm text-muted-foreground">Your email address has been verified</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              Verified
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-4">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Phone Verification</h4>
                <p className="text-sm text-muted-foreground">Add your phone number for additional verification</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Verify Phone
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-4">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Identity Verification</h4>
                <p className="text-sm text-muted-foreground">Verify your identity to unlock premium deals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Verify Identity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
