
import { supabase } from "@/integrations/supabase/client";

export const initializeAppEnvironment = async () => {
  try {
    // Initialize storage buckets
    await createStorageBucket();
    return true;
  } catch (error) {
    console.error("Error initializing app environment:", error);
    return false;
  }
};

const createStorageBucket = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('create-storage-bucket');
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating storage bucket:", error);
    throw error;
  }
};
