
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request parameters
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(`Instagram OAuth error: ${error}`)
    }

    if (!code) {
      throw new Error('No code provided')
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get Instagram credentials
    const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID')
    const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET')
    const redirectUri = Deno.env.get('INSTAGRAM_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Instagram configuration not set')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const userId = tokenData.user_id

    // Get user information
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`)
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await userResponse.json()

    // Get user from state param (contains JWT)
    const { data: authData } = await supabase.auth.getUser(state)
    if (!authData.user) {
      throw new Error('User not authenticated')
    }

    // Store profile in database
    const { data: profile, error } = await supabase
      .from('social_profiles')
      .upsert({
        user_id: authData.user.id,
        platform: 'instagram',
        username: userData.username,
        profile_url: `https://instagram.com/${userData.username}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken
      }, {
        onConflict: 'user_id, platform'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Redirect back to app with success query param
    const redirectUrl = new URL(redirectUri)
    redirectUrl.search = ''
    redirectUrl.pathname = '/social-connect'
    redirectUrl.searchParams.set('success', 'true')
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl.toString()
      }
    })
  } catch (error) {
    console.error('Error:', error)
    
    // Redirect back to app with error query param
    const redirectUri = Deno.env.get('INSTAGRAM_REDIRECT_URI') || '/'
    const redirectUrl = new URL(redirectUri)
    redirectUrl.search = ''
    redirectUrl.pathname = '/social-connect'
    redirectUrl.searchParams.set('error', error.message)
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl.toString()
      }
    })
  }
})
