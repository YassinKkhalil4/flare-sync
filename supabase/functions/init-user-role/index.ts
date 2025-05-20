
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// This function will be triggered by a webhook when new users sign up
// It ensures they have the appropriate role assigned in the user_roles table

serve(async (req) => {
  try {
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user data from the request body
    const { user, type } = await req.json()
    
    if (type !== 'INSERT' || !user?.id) {
      return new Response(
        JSON.stringify({ message: 'Not a user creation event or missing user ID' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing new user: ${user.id}`)
    
    // Extract role from user metadata if available, default to 'user'
    const userMetadata = user.raw_user_meta_data || {}
    const requestedRole = userMetadata.role || 'user'
    
    // Make sure the role is valid
    const validRole = ['user', 'creator', 'brand'].includes(requestedRole) ? 
      requestedRole : 'user'

    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      
    if (existingRole) {
      console.log(`User ${user.id} already has role: ${existingRole.role}`)
      return new Response(
        JSON.stringify({ success: true, message: 'User already has a role', role: existingRole.role }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add role to user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: validRole
      })

    if (roleError) {
      console.error(`Error setting role for user ${user.id}:`, roleError)
      throw roleError
    }

    console.log(`Successfully set role '${validRole}' for user ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, role: validRole }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in init-user-role function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
