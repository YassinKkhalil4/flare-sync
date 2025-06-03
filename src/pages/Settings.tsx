
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, UserCircle } from 'lucide-react';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 backdrop-blur">
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <ProfileSettings />
              <PreferencesSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
