
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin, AdminPermission } from '@/services/adminService';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CreateAdminUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, createAdminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  
  // Admin user details
  const adminDetails = {
    email: 'yassinkhalil@flaresync.org',
    password: 'Khalil_270110',
    fullName: 'Yassin Khalil',
    role: 'founder'
  };

  const permissions: AdminPermission[] = [
    'users_manage',
    'content_manage',
    'social_manage',
    'conversations_manage',
    'analytics_view',
    'admins_manage'
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        toast({
          title: 'Access Denied',
          description: 'You must be an admin to access this page',
          variant: 'destructive',
        });
        navigate('/admin-login');
      }
    };

    checkAdminStatus();
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Create admin user automatically when the component mounts
    if (!isCreated && !isLoading) {
      handleCreate();
    }
  }, [isCreated]);

  const handleCreate = async () => {
    if (isCreated) return;
    
    setIsLoading(true);
    
    try {
      const success = await createAdminUser(
        adminDetails.email,
        adminDetails.password,
        adminDetails.fullName,
        permissions
      );

      if (success) {
        setIsCreated(true);
        toast({
          title: 'Admin Created',
          description: `Successfully created admin user: ${adminDetails.fullName} (${adminDetails.email})`,
        });
        
        // Give some time for the toast to show before redirecting
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        throw new Error('Failed to create admin user');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authorization Required</CardTitle>
            <CardDescription>Please log in to continue</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/admin-login')}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Create Admin User</CardTitle>
          </div>
          <CardDescription>Creating admin user automatically...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p><strong>Email:</strong> {adminDetails.email}</p>
            <p><strong>Full Name:</strong> {adminDetails.fullName}</p>
            <p><strong>Role:</strong> {adminDetails.role}</p>
            <p><strong>Status:</strong> {isCreated ? 'Created successfully' : 'Creating...'}</p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Creating admin account...</span>
              </div>
            ) : isCreated ? (
              <p className="text-green-600 font-medium">Admin user created successfully!</p>
            ) : (
              <p className="text-amber-600">Initializing...</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdminUser;
