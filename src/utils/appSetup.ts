
import { supabase } from '@/integrations/supabase/client';
import { storageService } from '@/services/storageService';

/**
 * Initialize application environment
 * This includes setting up storage buckets and other necessary resources
 */
export const initializeAppEnvironment = async () => {
  try {
    console.log("Starting app environment initialization");
    
    // Test Supabase connection
    const { data: pingData, error: pingError } = await supabase.from('profiles').select('count').limit(1);
    
    if (pingError) {
      console.error("Supabase connection error:", pingError);
      return {
        success: false,
        error: "Failed to connect to Supabase: " + pingError.message
      };
    }
    
    console.log("Supabase connection successful");
    
    // Initialize storage (create buckets if they don't exist)
    const storageResult = await storageService.initializeStorage();
    
    if (!storageResult.success) {
      console.error("Storage initialization error:", storageResult.error);
      return {
        success: false,
        error: "Failed to initialize storage: " + storageResult.message
      };
    }
    
    console.log("Storage initialized successfully:", storageResult.buckets);
    
    return {
      success: true,
      message: "App environment initialized successfully"
    };
  } catch (error) {
    console.error("App initialization error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown initialization error"
    };
  }
};
