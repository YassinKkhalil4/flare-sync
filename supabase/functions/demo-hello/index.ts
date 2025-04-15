
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface RequestBody {
  name?: string
}

serve(async (req) => {
  try {
    // Get the request body
    let body: RequestBody = {}
    try {
      body = await req.json()
    } catch (e) {
      // If the body can't be parsed, use an empty object
    }

    const name = body.name || 'World'

    // Return a response
    return new Response(
      JSON.stringify({
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
