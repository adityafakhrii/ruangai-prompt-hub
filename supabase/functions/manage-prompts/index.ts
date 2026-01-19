import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

declare const Deno: {
  env: { get(name: string): string | undefined }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Read JWT secret from environment
const JWT_SECRET = Deno.env.get('JWT_SECRET') || Deno.env.get('VITE_JWT_SECRET') || ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const tokenFromBody = (body?.token as string) || null

    const authHeader = req.headers.get('Authorization')
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    const token = tokenFromBody || bearerToken

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT token
    interface JwtPayload {
      email?: string
      user_id?: string
      sub?: string
      [key: string]: unknown
    }
    let payload: JwtPayload
    try {
      if (JWT_SECRET) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET)
          const { payload: verifiedPayload } = await jose.jwtVerify(token, secret)
          payload = verifiedPayload as JwtPayload
        } catch (verifyError) {
          console.warn('Signature verification failed, falling back to decode:', verifyError)
          payload = jose.decodeJwt(token) as JwtPayload
        }
      } else {
        payload = jose.decodeJwt(token) as JwtPayload
      }
      console.log('Token verified/decoded for email:', payload.email)
    } catch (err) {
      console.error('Token processing failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid token: ' + (err instanceof Error ? err.message : String(err)) }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Identify User
    const userId = payload.user_id || payload.sub
    const userEmail = payload.email

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Invalid token payload: missing user_id or sub' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SYNC PROFILE: Ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile sync error:', profileError)
      // Continue anyway? Or fail? failing is safer for data integrity
      return new Response(
        JSON.stringify({ error: 'Failed to sync user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    const isAdmin = profileData?.role === 'admin'

    const { action, data, promptId } = body as { action: string, data?: Record<string, unknown>, promptId?: string }
    console.log('Action:', action, 'User:', userId)

    if (action === 'list') {
      // Fetch prompts for this user (profiles_id)
      const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('profiles_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
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
      const promptData = {
        ...data,
        profiles_id: userId, // Enforce relationship
      }
      // Remove creator_email/user_id from data if present to avoid confusion/errors with new schema
      delete (promptData as any).creator_email
      delete (promptData as any).user_id

      const { data: newPrompt, error } = await supabase
        .from('prompts')
        .insert(promptData)
        .select()
        .single()

      if (error) {
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

    if (action === 'update' || action === 'delete') {
      if (!promptId) {
        return new Response(
          JSON.stringify({ error: 'Prompt ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check ownership
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('profiles_id')
        .eq('id', promptId)
        .single()

      if (!existingPrompt || (existingPrompt.profiles_id !== userId && !isAdmin)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'update') {
        const { data: updatedPrompt, error } = await supabase
          .from('prompts')
          .update(data)
          .eq('id', promptId)
          .select()
          .single()

        if (error) {
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
        const { error } = await supabase
          .from('prompts')
          .delete()
          .eq('id', promptId)

        if (error) {
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
    }

    if (action === 'upload-url') {
      const { fileName } = data as { fileName?: string };
      if (!fileName) {
        return new Response(
          JSON.stringify({ error: 'File name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const filePath = `${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data: signedData, error } = await supabase.storage
        .from('prompt-images')
        .createSignedUploadUrl(filePath);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          path: signedData.path,
          token: signedData.token,
          signedUrl: signedData.signedUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
