import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, User, Camera, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

const CreatorProfile = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { plan } = useSubscription();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    location: '',
    website: '',
    categories: []
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile({
        name: formData.name
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl) {
        toast({
          title: 'Avatar updated',
          description: 'Your profile picture has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload your profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
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
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your profile image will be shown to brands and followers</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <Avatar className="h-32 w-32">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" type="button" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Image
                      </>
                    )}
                  </Button>
                </label>
              </CardFooter>
            </Card>
            
            {/* Profile Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details visible to brands and other users</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Display Name
                    </label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Your display name"
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange}
                      placeholder="Tell brands and others about yourself"
                      disabled={isUpdating}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        disabled={isUpdating}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <Input 
                        id="website" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" form="profile-form" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Verification Status */}
          <Card className="mt-8">
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
