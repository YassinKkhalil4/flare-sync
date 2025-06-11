
import { supabase } from '@/integrations/supabase/client';
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
        errorHandler.logError(new Error(pingError.message), 'Supabase connection test');
        // Don't fail completely for connection issues
      } else {
        console.log("Supabase connection successful");
      }
    } catch (connectionError) {
      console.warn("Supabase connection test failed:", connectionError);
      errorHandler.logError(connectionError as Error, 'Supabase connection');
      // Continue with initialization even if connection test fails
    }
    
    // Check if storage buckets exist
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.warn("Could not check storage buckets:", bucketsError);
      } else {
        const bucketNames = buckets.map(bucket => bucket.name);
        console.log("Available storage buckets:", bucketNames);
        
        if (bucketNames.includes('content-uploads') && bucketNames.includes('avatars')) {
          console.log("Storage buckets are properly configured");
        } else {
          console.warn("Some storage buckets may be missing. Expected: content-uploads, avatars");
        }
      }
    } catch (storageError) {
      console.warn("Error checking storage configuration:", storageError);
      errorHandler.logError(storageError as Error, 'Storage check');
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
