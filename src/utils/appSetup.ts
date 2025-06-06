
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from '@/services/storageService';
import { errorHandler } from '@/utils/errorHandler';

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
        errorHandler.logError(pingError.message, 'Supabase connection test');
        // Don't fail completely for connection issues
      } else {
        console.log("Supabase connection successful");
      }
    } catch (connectionError) {
      console.warn("Supabase connection test failed:", connectionError);
      errorHandler.logError(connectionError as Error, 'Supabase connection');
      // Continue with initialization even if connection test fails
    }
    
    // Initialize storage using static method
    const storageResult = await StorageService.initializeStorage();
    
    if (!storageResult.success) {
      console.warn("Storage initialization had issues:", storageResult.error);
      errorHandler.logError(storageResult.error || 'Storage initialization failed', 'Storage setup');
      // Don't fail the app for storage issues
    } else {
      console.log("Storage initialized:", storageResult.message);
    }

    // Initialize content tags if none exist
    try {
      const { data: existingTags } = await supabase
        .from('content_tags')
        .select('count')
        .limit(1);

      if (!existingTags || existingTags.length === 0) {
        // Create some default tags
        const defaultTags = [
          'Social Media', 'Marketing', 'Photography', 'Video', 'Tutorial',
          'Behind the Scenes', 'Product Review', 'Lifestyle', 'Business', 'Personal'
        ];

        const { error: tagsError } = await supabase
          .from('content_tags')
          .insert(defaultTags.map(name => ({ name })));

        if (tagsError) {
          console.warn('Could not create default tags:', tagsError);
        } else {
          console.log('Default content tags created');
        }
      }
    } catch (tagsError) {
      console.warn('Error setting up default tags:', tagsError);
    }
    
    return {
      success: true,
      message: "App environment initialized successfully",
      error: null
    };
  } catch (error) {
    console.error("App initialization error:", error);
    errorHandler.logError(error as Error, 'App initialization');
    
    // Even if there are errors, let the app continue
    // Most functionality can work without perfect initialization
    return {
      success: true,
      message: "App initialization completed with warnings",
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
