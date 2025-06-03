
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { usePasswordForm } from '@/hooks/usePasswordForm';
import { usePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings = () => {
  const { toast } = useToast();
  const {
    passwordForm,
    setPasswordForm,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    isUpdating,
    handlePasswordChange
  } = usePasswordForm();
  
  const { preferences, handlePreferenceChange } = usePreferences();

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="border-muted-foreground/20 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="border-muted-foreground/20 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="border-muted-foreground/20 focus:border-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Privacy & Security</CardTitle>
              <CardDescription>Control how your information is shared and secured</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={preferences.twoFactorEnabled ? "default" : "secondary"}>
                {preferences.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Switch 
                checked={preferences.twoFactorEnabled} 
                onCheckedChange={(checked) => handlePreferenceChange('twoFactorEnabled', checked)}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-destructive/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Irreversible actions that will permanently affect your account</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive"
                className="bg-gradient-to-r from-destructive to-destructive/80"
                onClick={() => {
                  toast({
                    title: "Not implemented",
                    description: "Account deletion is not yet implemented.",
                    variant: "destructive"
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
