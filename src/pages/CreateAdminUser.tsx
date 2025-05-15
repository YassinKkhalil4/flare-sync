
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin, AdminPermission } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CreateAdminUser = () => {
  const navigate = useNavigate();
  const { createAdminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleCreate = async () => {
    if (isCreated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Creating admin user");
      
      // Check if admin user already exists by using a simpler query
      const { data: existingUserData, error: existingUserError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin')
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') {
        // PGRST116 is "Results contain 0 rows" which just means no admin exists yet
        console.error("Error checking for existing admin:", existingUserError);
      }
      
      if (existingUserData) {
        console.log("Admin user already exists");
        setIsCreated(true);
        toast({
          title: 'Admin User Exists',
          description: `Admin user already exists`,
          variant: 'success'
        });
        
        // Give some time for the toast to show before redirecting
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
        return;
      }
      
      const success = await createAdminUser(
        adminDetails.email,
        adminDetails.password,
        adminDetails.fullName,
        permissions
      );

      if (success) {
        console.log("Admin user created successfully");
        setIsCreated(true);
        toast({
          title: 'Admin Created',
          description: `Successfully created admin user: ${adminDetails.fullName} (${adminDetails.email})`,
          variant: 'success'
        });
        
        // Give some time for the toast to show before redirecting
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      } else {
        throw new Error('Failed to create admin user');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError(error instanceof Error ? error.message : 'Failed to create admin user');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin user',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Create Admin User</CardTitle>
          </div>
          <CardDescription>Create the initial admin user for FlareSync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p><strong>Email:</strong> {adminDetails.email}</p>
            <p><strong>Full Name:</strong> {adminDetails.fullName}</p>
            <p><strong>Role:</strong> {adminDetails.role}</p>
            <p><strong>Status:</strong> {isCreated ? 'Created successfully' : isLoading ? 'Creating...' : 'Ready to create'}</p>
            {error && (
              <div className="text-red-500 text-sm mt-2">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
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
              <Button 
                className="w-full" 
                onClick={handleCreate} 
                disabled={isLoading}
              >
                Create Admin User
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdminUser;
