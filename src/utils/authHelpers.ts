
/**
 * Helper function to clean up any existing auth state
 * This is useful for avoiding conflicts when signing in or out
 */
export const cleanupAuthState = (): void => {
  try {
    // Clear any lingering auth tokens or state from localStorage
    localStorage.removeItem('sb-lkezjcqdvxfrrfwwyjcp-auth-token');
    
    // Additional cleanup can be added here as needed
    console.log('Auth state cleaned up');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};
