
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getSupabaseClient = (serviceRole = false) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseKey = serviceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') 
    : Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
};
