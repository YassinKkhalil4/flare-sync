import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Camera, Check, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import AvatarUpload from '@/components/Profile/AvatarUpload';
import ProfileInformation from '@/components/Profile/ProfileInformation';
import VerificationStatus from '@/components/Profile/VerificationStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const CreatorProfile = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  
  if (!user) {
    return (
      <div className="container max-w-4xl py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';
  
  return (
    <div className="container max-w-4xl py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Creator Profile</h1>
          <p className="text-muted-foreground">Manage your profile and account settings</p>
        </div>
        <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
          {plan.toUpperCase()} Plan
        </div>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your profile image will be shown to brands and followers</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <AvatarUpload userInitials={userInitials} avatarUrl={user.avatar} />
                <div className="text-center mt-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details visible to brands and other users</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileInformation />
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <VerificationStatus />
          </div>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Email Notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="notify-messages" className="text-sm">New messages</label>
                        <input type="checkbox" id="notify-messages" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="notify-deals" className="text-sm">New brand deals</label>
                        <input type="checkbox" id="notify-deals" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="notify-updates" className="text-sm">Platform updates</label>
                        <input type="checkbox" id="notify-updates" className="toggle" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-3">Account Security</h3>
                    <Button variant="outline" className="mb-3">Change Password</Button>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with a strong password and two-factor authentication
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-red-500 mb-3">Danger Zone</h3>
                    <Button variant="destructive">Delete Account</Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      This action cannot be undone. It will permanently delete your account and remove all data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Your current plan and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold uppercase">{plan}</div>
                  <div className="text-sm text-muted-foreground">
                    {plan === 'free' && 'Basic features for getting started'}
                    {plan === 'basic' && 'Enhanced tools for growing creators'}
                    {plan === 'pro' && 'Professional tools for serious creators'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {plan === 'free' && (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Connect 1 social account</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Basic analytics</span>
                      </div>
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-muted-foreground">Advanced analytics</span>
                      </div>
                    </>
                  )}
                  
                  {plan === 'basic' && (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Connect 3 social accounts</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>8% commission on brand deals</span>
                      </div>
                    </>
                  )}
                  
                  {plan === 'pro' && (
                    <>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Unlimited social accounts</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Comprehensive analytics</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>5% commission on brand deals</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span>Priority support</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan === 'pro' ? 'outline' : 'default'}>
                  {plan === 'pro' ? 'Manage Subscription' : 'Upgrade Plan'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Personal Branding</CardTitle>
              <CardDescription>Customize how brands and followers see you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Content Categories</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select categories that best describe your content (up to 3)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Fashion', 'Beauty', 'Fitness', 'Technology', 'Food', 'Travel', 'Lifestyle', 'Gaming'].map(category => (
                      <div key={category} className="border rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-primary/10">
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Brand Pitch</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Write a brief pitch that will be shown to brands looking for creators
                  </p>
                  <Textarea 
                    placeholder="I'm a creator who specializes in creating authentic content about..."
                    rows={4}
                    className="mb-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    0/250 characters
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Contact Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="contact-direct" className="text-sm">Direct messaging</label>
                      <input type="checkbox" id="contact-direct" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="contact-collab" className="text-sm">Collaboration requests</label>
                      <input type="checkbox" id="contact-collab" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="contact-brand" className="text-sm">Brand deal inquiries</label>
                      <input type="checkbox" id="contact-brand" defaultChecked className="toggle" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Save Branding Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorProfile;
