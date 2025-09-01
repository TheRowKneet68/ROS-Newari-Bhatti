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

    const { action, categoryId, itemData } = await req.json()

    if (action === 'getCategories') {
      const { data: categories, error } = await supabaseClient
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, categories }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getMenuItems') {
      let query = supabaseClient
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(id, name, slug)
        `)
        .eq('is_available', true)

      if (categoryId && categoryId !== 'all') {
        // Check if categoryId is a slug or ID
        if (categoryId.includes('-') || !categoryId.match(/^[0-9a-f-]+$/)) {
          // It's likely a slug
          const { data: category } = await supabaseClient
            .from('menu_categories')
            .select('id')
            .eq('slug', categoryId)
            .single()
          
          if (category) {
            query = query.eq('category_id', category.id)
          }
        } else {
          // It's likely an ID
          query = query.eq('category_id', categoryId)
        }
      }

      const { data: menuItems, error } = await query.order('popularity_score', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, menuItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getMenuData') {
      // Get categories
      const { data: categories, error: catError } = await supabaseClient
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (catError) throw catError

      // Get all menu items with category info
      const { data: menuItems, error: itemError } = await supabaseClient
        .from('menu_items')
        .select(`
          *,
          category:menu_categories(id, name, slug)
        `)
        .order('created_at', { ascending: false })

      if (itemError) throw itemError

      return new Response(
        JSON.stringify({ success: true, categories, menuItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'addMenuItem') {
      const { data: newItem, error } = await supabaseClient
        .from('menu_items')
        .insert({
          category_id: itemData.categoryId,
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          image_url: itemData.imageUrl,
          ingredients: itemData.ingredients,
          is_vegetarian: itemData.isVegetarian,
          preparation_time: itemData.preparationTime || 15
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, item: newItem }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateMenuItem') {
      const { data: updatedItem, error } = await supabaseClient
        .from('menu_items')
        .update({
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          image_url: itemData.imageUrl,
          ingredients: itemData.ingredients,
          is_vegetarian: itemData.isVegetarian,
          is_available: itemData.isAvailable,
          preparation_time: itemData.preparationTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemData.id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, item: updatedItem }),
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})