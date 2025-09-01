import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { action, email, password, firstName, lastName, phone, address } = await req.json();

    if (action === 'register') {
      // Sign up user with Supabase Auth
      const { data: authUser, error: authError } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // Insert profile into users table
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert({
          id: authUser.user?.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          address_street: address?.street || null,
          address_city: address?.city || 'Pokhara',
          address_state: address?.state || 'Gandaki Province',
          address_zip_code: address?.zipCode || '33700',
          role: 'user'
        })
        .select()
        .single();

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }

      return new Response(JSON.stringify({ success: true, user: newUser }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'login') {
      // Login using Supabase Auth
      const { data: session, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (loginError || !session.user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        });
      }

      // Fetch user profile
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        return new Response(JSON.stringify({ error: 'User profile not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }

      return new Response(JSON.stringify({ success: true, user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
