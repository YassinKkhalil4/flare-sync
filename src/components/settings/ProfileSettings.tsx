
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEmailForm } from '@/hooks/useEmailForm';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { emailForm, setEmailForm, isUpdating, handleEmailChange } = useEmailForm();

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UserCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="current-email" className="text-sm font-medium">Current Email</Label>
              <Input 
                id="current-email" 
                value={user?.email || ''} 
                disabled 
                className="bg-muted/50 border-0" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="role" 
                  value={user?.role || ''} 
                  disabled 
                  className="bg-muted/50 border-0 capitalize flex-1" 
                />
                <Badge variant="outline" className="capitalize">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Mail className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Change Email</CardTitle>
              <CardDescription>Update your email address</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter your new email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                className="border-muted-foreground/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-password">Current Password</Label>
              <Input
                id="email-password"
                type="password"
                placeholder="Enter your current password"
                value={emailForm.password}
                onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                className="border-muted-foreground/20 focus:border-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
