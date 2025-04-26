
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Preferences */}
      <NotificationPreferences />
      
      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button 
            variant="destructive"
            onClick={() => {
              toast({
                title: "Not implemented",
                description: "Account deletion is not yet implemented.",
                variant: "destructive"
              });
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
