
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'creator' | 'brand';

interface RegisterUserParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

interface UpdateProfileParams {
  fullName?: string;
  username?: string;
  avatarUrl?: string;
  onboarded?: boolean;
}

export const userService = {
  /**
   * Register a new user
   */
  async registerUser({ email, password, fullName, role }: RegisterUserParams) {
    try {
      // Register user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // Ensure user has the correct role in the user_roles table
      // This is normally handled by our database trigger and function,
      // but we'll do it here as well to ensure consistency
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role
        })
        .select()
        .single();
      
      // If the role already exists, it's fine, continue
      if (roleError && !roleError.message.includes('duplicate key')) {
        console.error('Error setting user role:', roleError);
      }
      
      return {
        success: true,
        user: authData.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register user'
      };
    }
  },
  
  /**
   * Update user profile
   */
  async updateProfile(userId: string, profile: UpdateProfileParams) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          username: profile.username,
          avatar_url: profile.avatarUrl,
          onboarded: profile.onboarded,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  },
  
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      };
    }
  },
  
  /**
   * Get user role
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['creator', 'brand'])
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }
};
