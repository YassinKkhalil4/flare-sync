
import { supabase } from '@/integrations/supabase/client';
import { deploymentConfig } from '@/config/deployment';

export const initializeAppEnvironment = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return { success: false, message: 'Database connection failed' };
    }

    // Initialize any required app state
    console.log('App environment initialized successfully');
    console.log('Environment:', deploymentConfig.environment);
    console.log('Features enabled:', deploymentConfig.features);

    return { success: true, message: 'App initialized successfully' };
  } catch (error) {
    console.error('Failed to initialize app environment:', error);
    return { success: false, message: 'Initialization failed' };
  }
};
