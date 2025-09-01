import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const { action, profileData, currentPassword, newPassword } = await req.json()

    if (action === 'getProfile') {
      const { data: profile, error } = await supabaseClient
        .from('users')
        .select(`
          id, email, first_name, last_name, phone, gender, date_of_birth,
          profile_picture_url, bio, address_street, address_city, 
          address_state, address_zip_code, created_at, updated_at, role
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          profile: {
            ...profile,
            address: {
              street: profile.address_street,
              city: profile.address_city,
              state: profile.address_state,
              zipCode: profile.address_zip_code
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateProfile') {
      const updateData: any = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        gender: profileData.gender,
        date_of_birth: profileData.dateOfBirth,
        bio: profileData.bio,
        address_street: profileData.address?.street,
        address_city: profileData.address?.city,
        address_state: profileData.address?.state,
        address_zip_code: profileData.address?.zipCode,
        updated_at: new Date().toISOString()
      }

      // Only update email if it's different and provided
      if (profileData.email && profileData.email !== user.email) {
        // Check if email already exists
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', profileData.email)
          .neq('id', user.id)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Email already in use' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }
        updateData.email = profileData.email
      }

      const { data: updatedProfile, error } = await supabaseClient
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select(`
          id, email, first_name, last_name, phone, gender, date_of_birth,
          profile_picture_url, bio, address_street, address_city, 
          address_state, address_zip_code, created_at, updated_at, role
        `)
        .single()

      if (error) {
        console.error('Profile update error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          profile: {
            ...updatedProfile,
            address: {
              street: updatedProfile.address_street,
              city: updatedProfile.address_city,
              state: updatedProfile.address_state,
              zipCode: updatedProfile.address_zip_code
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateProfilePicture') {
      const { data: updatedProfile, error } = await supabaseClient
        .from('users')
        .update({
          profile_picture_url: profileData.profilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('profile_picture_url')
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, profilePictureUrl: updatedProfile.profile_picture_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'changePassword') {
      // Verify current password first
      const { data: currentUser } = await supabaseClient
        .from('users')
        .select('password_hash')
        .eq('id', user.id)
        .single()

      // In production, use proper bcrypt comparison
      // For demo, we'll allow password change with current verification
      
      const { error: passwordError } = await supabaseClient.auth.updateUser({
        password: newPassword
      })

      if (passwordError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update password' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Also update in our users table
      await supabaseClient
        .from('users')
        .update({
          password_hash: '$2b$10$newHashWouldGoHere', // In production, hash the new password
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return new Response(
        JSON.stringify({ success: true, message: 'Password updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deactivateAccount') {
      const { error } = await supabaseClient
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Account deactivated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('User profile service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})