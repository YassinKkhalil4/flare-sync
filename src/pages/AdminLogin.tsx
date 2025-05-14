
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('AdminLogin component rendered');

  // Redirect if user is already logged in as admin
  useEffect(() => {
    console.log('AdminLogin useEffect - user status:', user);
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('Attempting admin login with:', email);
      
      // First, clear any existing auth data to prevent conflicts
      try {
        // Clear auth storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Try to sign out first to clear any existing sessions
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Cleared previous auth state');
      } catch (clearError) {
        console.warn('Error clearing previous auth state:', clearError);
        // Continue with login attempt even if this fails
      }

      // Use direct Supabase client to avoid captcha issues when in development/testing
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Auth response:', { data, error });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.user) {
        throw new Error('Authentication failed. Please check your credentials.');
      }

      // Check if the user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      console.log('Admin role check:', { roleData, roleError });
      
      if (roleError) {
        throw new Error('Error verifying admin access: ' + roleError.message);
      }
      
      if (!roleData) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin dashboard.',
      });
      
      // Force a page reload to ensure all auth state is refreshed
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);

    } catch (error) {
      console.error('Admin authentication error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(errorMsg);
      toast({
        title: 'Admin Login Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Access the FlareSync admin dashboard
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Authenticating...
                </div>
              ) : (
                'Login as Admin'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
