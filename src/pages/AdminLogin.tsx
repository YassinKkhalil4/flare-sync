
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('yassinkhalil@flaresync.org');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("AdminLogin component rendered");
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting admin login with:", email);
      
      // First sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message || 'Authentication failed');
      }
      
      if (!authData?.user) {
        throw new Error('No user data returned');
      }
      
      // Then check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleError) {
        console.error("Role check error:", roleError);
        throw new Error('Error verifying admin status');
      }
      
      if (!roleData) {
        // Sign out if not admin
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      console.log("Admin login successful");
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard',
        variant: 'success'
      });
      
      // Navigate to admin dashboard
      navigate('/admin');

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
      
      // If login failed and the error might be due to admin user not created yet,
      // suggest creating admin user first
      if (error instanceof Error && 
          (error.message.includes('Invalid login credentials') || 
           error.message.includes('User not found'))) {
        toast({
          title: 'Admin User Not Found',
          description: 'You may need to create the admin user first',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSignInDisabled = !email || !password || isLoading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="admin@example.com"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            {errorMessage && (
              <div className="bg-destructive/15 p-3 rounded-md flex gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSignInDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="text-center">
              <Button
                variant="link"
                type="button"
                onClick={() => navigate('/create-admin')}
                className="mt-2"
              >
                Create Admin User
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Admin access only. Unauthorized access is prohibited.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
