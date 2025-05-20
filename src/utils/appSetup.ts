
import { supabase } from "@/lib/supabase";

export const initializeAppEnvironment = async () => {
  try {
    console.log("Initializing app environment...");
    
    // Verify database connection - use a simple query that doesn't depend on specific tables
    const { error: connectionError } = await supabase.from('profiles').select('count').single();
    
    if (connectionError) {
      console.error("Database connection error:", connectionError);
      return { success: false, error: 'Database connection failed: ' + connectionError.message };
    }
    
    console.log("Database connection successful");
    
    // Initialize storage buckets
    try {
      await ensureStorageBucketExists();
    } catch (storageError) {
      console.warn("Storage initialization warning:", storageError);
      // Continue despite storage error - this is not critical for app initialization
    }
    
    // Verify admin user exists
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .maybeSingle();
        
      return { 
        success: true, 
        adminUserExists: !!adminData,
        adminError: adminError ? adminError.message : null
      };
    } catch (adminCheckError) {
      console.warn("Admin check warning:", adminCheckError);
      // Continue despite admin check error
      return { success: true, adminCheckError: adminCheckError.message };
    }
  } catch (error) {
    console.error("Error initializing app environment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown initialization error' 
    };
  }
};

// Ensure that required storage buckets exist
const ensureStorageBucketExists = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn("Unable to list storage buckets:", listError);
      return false;
    }
    
    // Create the user-content bucket if it doesn't exist
    const userContentBucketExists = buckets?.some(bucket => bucket.name === 'user-content');
    
    if (!userContentBucketExists) {
      try {
        const { error: createError } = await supabase.storage.createBucket('user-content', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        
        if (createError) {
          console.warn("Unable to create user-content bucket:", createError);
          return false;
        }
        console.log("Created user-content bucket");
      } catch (createBucketError) {
        console.warn("Error creating bucket:", createBucketError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.warn("Error ensuring storage buckets:", error);
    return false;
  }
};
