
import { supabase } from '@/integrations/supabase/client';
import { storageService } from '@/services/storageService';

/**
 * Initialize application environment
 * This includes setting up storage buckets and other necessary resources
 */
export const initializeAppEnvironment = async () => {
  try {
    console.log("Starting app environment initialization");
    
    // Test Supabase connection with a simple ping
    try {
      const { data: pingData, error: pingError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (pingError) {
        console.warn("Supabase connection warning:", pingError);
        // Don't fail completely for connection issues
      } else {
        console.log("Supabase connection successful");
      }
    } catch (connectionError) {
      console.warn("Supabase connection test failed:", connectionError);
      // Continue with initialization even if connection test fails
    }
    
    // Initialize storage (create buckets if they don't exist)
    // This is now more resilient and won't fail the entire app
    const storageResult = await storageService.initializeStorage();
    
    if (!storageResult.success) {
      console.warn("Storage initialization had issues:", storageResult.error);
      // Don't fail the app for storage issues
    } else {
      console.log("Storage initialized:", storageResult.message);
    }
    
    return {
      success: true,
      message: "App environment initialized successfully"
    };
  } catch (error) {
    console.error("App initialization error:", error);
    
    // Even if there are errors, let the app continue
    // Most functionality can work without perfect initialization
    return {
      success: true,
      message: "App initialization completed with warnings"
    };
  }
};
