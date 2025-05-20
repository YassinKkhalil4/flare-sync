
import { supabase } from "@/integrations/supabase/client";

export const initializeAppEnvironment = async () => {
  try {
    // Verify database connection
    const { error: connectionError } = await supabase.from('profiles').select('id').limit(1);
    
    if (connectionError) {
      console.error("Database connection error:", connectionError);
      return { success: false, error: 'Database connection failed' };
    }
    
    // Initialize storage buckets
    await ensureStorageBucketExists();
    
    // Verify admin user exists
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
  } catch (error) {
    console.error("Error initializing app environment:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Ensure that required storage buckets exist
const ensureStorageBucketExists = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    // Create the user-content bucket if it doesn't exist
    const userContentBucketExists = buckets?.some(bucket => bucket.name === 'user-content');
    
    if (!userContentBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('user-content', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      
      if (createError) throw createError;
      console.log("Created user-content bucket");
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring storage buckets:", error);
    throw error;
  }
};
