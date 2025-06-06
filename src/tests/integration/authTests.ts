
import { supabase } from '@/integrations/supabase/client';
import { testHelper } from '../utils/testHelpers';

export class AuthTestSuite {
  async runSignupTest(): Promise<void> {
    const testEmail = `signup_test_${Date.now()}@test.com`;
    const testPassword = 'SecureTestPassword123!';

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('No user data returned from signup');
    }

    // Verify profile was created
    await testHelper.waitForCondition(async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user!.id)
        .single();
      return !!profile;
    }, 3000);

    // Verify user role was assigned
    await testHelper.assertDatabaseState('user_roles', {
      user_id: data.user.id
    });
  }

  async runLoginTest(): Promise<void> {
    // First create a test user
    const testUserId = await testHelper.setupTestUser();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('No authenticated user found');
    }

    // Verify session exists
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('No active session found');
    }

    if (session.session.user.id !== userData.user.id) {
      throw new Error('Session user mismatch');
    }
  }

  async runLogoutTest(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }

    // Verify no active session
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      throw new Error('Session still active after logout');
    }
  }

  async runPasswordResetTest(): Promise<void> {
    const testEmail = 'reset_test@example.com';
    
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  async runSessionPersistenceTest(): Promise<void> {
    // Get current session
    const { data: initialSession } = await supabase.auth.getSession();
    
    if (!initialSession.session) {
      throw new Error('No active session to test persistence');
    }

    // Simulate page refresh by checking session again
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: persistedSession } = await supabase.auth.getSession();
    
    if (!persistedSession.session) {
      throw new Error('Session was not persisted');
    }

    if (persistedSession.session.access_token !== initialSession.session.access_token) {
      throw new Error('Session tokens do not match');
    }
  }
}
