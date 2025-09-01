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
    )

    const { action, reviewId, reviewData, userId, isApproved } = await req.json()

    if (action === 'createReview') {
      console.log('Creating review with data:', reviewData)
      
      const { data: newReview, error } = await supabaseClient
        .from('reviews')
        .insert({
          user_id: userId || null,
          order_id: reviewData.orderId || null,
          name: reviewData.name,
          customer_name: reviewData.name,
          customer_email: reviewData.email,
          rating: reviewData.rating,
          review_text: reviewData.text,
          is_approved: true
        })
        .select()
        .single()

      if (error) {
        console.error('Review insert error:', error)
        throw error
      }

      console.log('Review created successfully:', newReview)
      return new Response(
        JSON.stringify({ success: true, review: newReview }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getReviews') {
      // For homepage - only get approved reviews
      const { data: reviews, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Reviews fetched:', reviews?.length || 0)

      return new Response(
        JSON.stringify({ success: true, reviews: reviews || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getAllReviews') {
      // Admin only - get all reviews including pending
      const { data: reviews, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, reviews }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'approveReview') {
      const { data: updatedReview, error } = await supabaseClient
        .from('reviews')
        .update({
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, review: updatedReview }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteReview') {
      const { error } = await supabaseClient
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'toggleFeatured') {
      const { data: updatedReview, error } = await supabaseClient
        .from('reviews')
        .update({
          is_featured: !reviewData.isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, review: updatedReview }),
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
    console.error('Review service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})