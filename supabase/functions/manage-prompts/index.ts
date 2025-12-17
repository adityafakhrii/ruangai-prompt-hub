import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JWT_SECRET = 'kuncirahasia123'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get heroic_token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT token
    let payload: any
    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload: verifiedPayload } = await jose.jwtVerify(token, secret)
      payload = verifiedPayload
      console.log('Token verified for email:', payload.email)
    } catch (err) {
      console.error('Token verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, data, promptId } = await req.json()
    console.log('Action:', action, 'Email:', payload.email)

    if (action === 'list') {
      // Fetch prompts by creator_email
      const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('creator_email', payload.email)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ prompts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create') {
      // Insert new prompt
      const promptData = {
        ...data,
        creator_email: payload.email,
      }
      console.log('Creating prompt:', promptData)

      const { data: newPrompt, error } = await supabase
        .from('prompts')
        .insert(promptData)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ prompt: newPrompt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update') {
      // Update existing prompt (verify ownership)
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('creator_email')
        .eq('id', promptId)
        .single()

      if (!existingPrompt || existingPrompt.creator_email !== payload.email) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to update this prompt' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: updatedPrompt, error } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', promptId)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ prompt: updatedPrompt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete') {
      // Delete prompt (verify ownership)
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('creator_email')
        .eq('id', promptId)
        .single()

      if (!existingPrompt || existingPrompt.creator_email !== payload.email) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to delete this prompt' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId)

      if (error) {
        console.error('Delete error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
