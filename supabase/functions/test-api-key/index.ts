
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../utils/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keyName, keyValue } = await req.json()

    let valid = false
    let error = null

    switch (keyName.toLowerCase()) {
      case 'openai_api_key':
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 
              'Authorization': `Bearer ${keyValue}`,
              'Content-Type': 'application/json'
            }
          })
          valid = response.status === 200
          if (!valid) {
            error = `OpenAI API returned status ${response.status}`
          }
        } catch (e) {
          error = 'Failed to connect to OpenAI API'
        }
        break

      case 'instagram_client_id':
      case 'instagram_client_secret':
        // For Instagram, we'll just check if the key format looks valid
        valid = keyValue.length > 10 && /^[a-zA-Z0-9_-]+$/.test(keyValue)
        if (!valid) {
          error = 'Invalid Instagram API key format'
        }
        break

      case 'twitter_client_id':
      case 'twitter_client_secret':
        // For Twitter, check basic format
        valid = keyValue.length > 10
        if (!valid) {
          error = 'Invalid Twitter API key format'
        }
        break

      case 'stripe_secret_key':
        // Stripe test keys start with sk_test_, live keys with sk_live_
        valid = keyValue.startsWith('sk_test_') || keyValue.startsWith('sk_live_')
        if (!valid) {
          error = 'Stripe secret key must start with sk_test_ or sk_live_'
        }
        break

      default:
        // For unknown keys, just check they're not empty
        valid = keyValue.trim().length > 0
    }

    return new Response(
      JSON.stringify({ valid, error }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error testing API key:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
