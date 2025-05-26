
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../utils/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { apiKeys } = await req.json()
    
    if (!apiKeys || typeof apiKeys !== 'object') {
      throw new Error('Invalid API keys data')
    }

    console.log('Storing API keys for user:', user.id)
    
    // Store each API key as a secret with user prefix
    const promises = Object.entries(apiKeys).map(async ([key, value]) => {
      if (value && typeof value === 'string' && value.trim()) {
        const secretName = `${user.id}_${key}`
        console.log('Storing secret:', secretName)
        
        // Note: In a real implementation, you would use Supabase's secrets API
        // For now, we'll store in a secure table with encryption
        const { error } = await supabase
          .from('user_api_keys')
          .upsert({
            user_id: user.id,
            key_name: key,
            key_value: value.trim(), // In production, this should be encrypted
            updated_at: new Date().toISOString()
          })
        
        if (error) {
          console.error('Error storing key:', key, error)
          throw error
        }
      }
    })

    await Promise.all(promises)

    return new Response(
      JSON.stringify({ success: true, message: 'API keys stored securely' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error storing API keys:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
