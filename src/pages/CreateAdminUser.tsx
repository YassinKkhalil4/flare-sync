
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin, AdminPermission } from '@/services/adminService';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const CreateAdminUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, createAdminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: 'yassinkhalil@flaresync.org',
    password: 'Admin@123456',
    fullName: 'Yassin Khalil',
  });

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    users_manage: true,
    content_manage: true,
    social_manage: true,
    conversations_manage: true,
    analytics_view: true,
    admins_manage: true
  });

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

  const handleCreate = async () => {
    setIsLoading(true);
    
    try {
      // Get selected permissions
      const selectedPermissions = Object.entries(permissions)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([permission]) => permission as AdminPermission);

      const success = await createAdminUser(
        formData.email,
        formData.password,
        formData.fullName,
        selectedPermissions
      );

      if (success) {
        toast({
          title: 'Admin Created',
          description: `Successfully created admin user ${formData.email}`,
        });
        navigate('/admin');
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
          <CardDescription>Create a new admin user with specific permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              disabled
            />
          </div>
          
          <div className="space-y-3 pt-2">
            <Label>Permissions</Label>
            
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => {
                      setPermissions({...permissions, [key]: checked === true});
                    }}
                  />
                  <label 
                    htmlFor={key}
                    className="text-sm font-medium leading-none"
                  >
                    {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCreate} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin...
              </>
            ) : (
              'Create Admin User'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAdminUser;
