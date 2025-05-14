
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  
  // Admin account creation states
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creationMessage, setCreationMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const { adminSignIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in as admin
  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, isAdmin } = await adminSignIn({ email, password });
      
      if (error) {
        throw new Error(error instanceof Error ? error.message : 'Authentication failed');
      }
      
      if (!isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // No need to navigate here as the adminSignIn function already does it on success
    } catch (error) {
      console.error('Admin authentication error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCreationMessage(null);
    
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            full_name: newName,
            role: 'admin'
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!signUpData?.user?.id) {
        throw new Error('Failed to create user account');
      }
      
      // Add admin role to the user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: signUpData.user.id,
          role: 'admin'
        });
        
      if (roleError) throw roleError;
      
      setCreationMessage({
        message: `Admin account created successfully! Email: ${newEmail}`,
        type: 'success'
      });
      
      // Clear form
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setNewName('');
      
      toast({
        title: 'Admin Created',
        description: `Admin account created successfully with email: ${newEmail}`,
      });
      
    } catch (error) {
      console.error('Admin creation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Admin creation failed';
      setCreationMessage({
        message: errorMsg,
        type: 'error'
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
            Access the admin portal or create a new admin account
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="create">Create Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
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
          </TabsContent>
          
          <TabsContent value="create">
            <form onSubmit={handleCreateAdmin}>
              <CardContent className="space-y-4">
                {creationMessage && (
                  <div className={`${
                    creationMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-destructive/15 text-destructive'
                  } p-3 rounded-md flex items-start`}>
                    {creationMessage.type === 'error' ? (
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <UserPlus className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{creationMessage.message}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newName">Full Name</Label>
                  <Input
                    id="newName"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Admin User"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button disabled={isLoading} type="submit" className="w-full">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating Admin...
                    </div>
                  ) : (
                    'Create Admin Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminLogin;
