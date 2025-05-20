
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreatorProfileForm from '@/components/Profile/CreatorProfileForm';

const CreatorProfile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{user?.name || 'Your Profile'}</CardTitle>
              <CardDescription>Manage your profile information and settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>View and edit your basic profile details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={user?.avatar || '/placeholder.svg'} 
                        alt={user?.name || 'Profile'}
                      />
                      <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">{user?.name || 'Unknown User'}</h2>
                      <p className="text-sm text-muted-foreground">@{user?.username || 'username'}</p>
                    </div>
                  </div>
                  <p>Email: {user?.email}</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div>
              <CreatorProfileForm />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorProfile;
