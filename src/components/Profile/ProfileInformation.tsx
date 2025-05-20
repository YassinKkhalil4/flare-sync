
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const ProfileInformation = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile({
        full_name: formData.full_name,
        // Assuming these fields would be added to the Profile type in database.ts
        bio: formData.bio,
        location: formData.location,
        website: formData.website
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

  return (
    <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Display Name</Label>
        <Input 
          id="full_name" 
          name="full_name" 
          value={formData.full_name} 
          onChange={handleInputChange} 
          placeholder="Your display name"
          disabled={isUpdating}
        />
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
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
          <Label htmlFor="location">Location</Label>
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
          <Label htmlFor="website">Website</Label>
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProfileInformation;
