
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Palette, Globe, Clock, LogOut } from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';
import { useAuth } from '@/context/AuthContext';

const PreferencesSettings = () => {
  const { signOut } = useAuth();
  const { preferences, handlePreferenceChange } = usePreferences();

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Palette className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Preferences</CardTitle>
              <CardDescription>Customize your FlareSync experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-save drafts</Label>
              <p className="text-xs text-muted-foreground">Automatically save your work as you type</p>
            </div>
            <Switch 
              checked={preferences.autoSave} 
              onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </Label>
              <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', value)}>
                <SelectTrigger className="border-muted-foreground/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                <SelectTrigger className="border-muted-foreground/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </Label>
              <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                <SelectTrigger className="border-muted-foreground/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={preferences.dateFormat} onValueChange={(value) => handlePreferenceChange('dateFormat', value)}>
                <SelectTrigger className="border-muted-foreground/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <LogOut className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Account Actions</CardTitle>
              <CardDescription>Sign out of your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be signed out of all devices and redirected to the login page.
            </p>
            <Button 
              onClick={signOut}
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border-blue-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesSettings;
