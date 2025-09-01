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

    const { action, categoryData, itemData, categoryId, itemId } = await req.json()

    console.log('Admin menu service called with action:', action)

    // Category Management
    if (action === 'addCategory') {
      console.log('Adding category:', categoryData)
      const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const { data: newCategory, error } = await supabaseClient
        .from('menu_categories')
        .insert({
          name: categoryData.name,
          slug: slug,
          description: categoryData.description || `Delicious ${categoryData.name} items from our kitchen`,
          icon: categoryData.icon || 'ri-restaurant-line',
          display_order: categoryData.displayOrder || 99,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Category insert error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, category: newCategory }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateCategory') {
      console.log('Updating category:', categoryId, categoryData)
      const slug = categoryData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const { data: updatedCategory, error } = await supabaseClient
        .from('menu_categories')
        .update({
          name: categoryData.name,  
          slug: slug,
          description: categoryData.description,
          icon: categoryData.icon,
          display_order: categoryData.displayOrder
        })
        .eq('id', categoryId)
        .select()
        .single()

      if (error) {
        console.error('Category update error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, category: updatedCategory }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteCategory') {
      console.log('Deleting category:', categoryId)
      // First check if category has items
      const { data: items } = await supabaseClient
        .from('menu_items')
        .select('id')
        .eq('category_id', categoryId)

      if (items && items.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete category with existing items' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const { error } = await supabaseClient
        .from('menu_categories')
        .delete()
        .eq('id', categoryId)

      if (error) {
        console.error('Category delete error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Menu Item Management
    if (action === 'addMenuItem') {
      console.log('Adding menu item:', itemData)
      const { data: newItem, error } = await supabaseClient
        .from('menu_items')
        .insert({
          category_id: itemData.categoryId,
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          image_url: itemData.imageUrl,
          ingredients: itemData.ingredients ? itemData.ingredients.split(',').map(i => i.trim()) : [],
          is_vegetarian: itemData.isVegetarian || false,
          preparation_time: itemData.preparationTime || 15,
          is_available: itemData.isAvailable !== false
        })
        .select()
        .single()

      if (error) {
        console.error('Menu item insert error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, item: newItem }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateMenuItem') {
      console.log('Updating menu item:', itemId, itemData)
      const { data: updatedItem, error } = await supabaseClient
        .from('menu_items')
        .update({
          category_id: itemData.categoryId,
          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          image_url: itemData.imageUrl,
          ingredients: itemData.ingredients ? itemData.ingredients.split(',').map(i => i.trim()) : [],
          is_vegetarian: itemData.isVegetarian,
          is_available: itemData.isAvailable,
          preparation_time: itemData.preparationTime
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) {
        console.error('Menu item update error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, item: updatedItem }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'deleteMenuItem') {
      console.log('Deleting menu item:', itemId)
      const { error } = await supabaseClient
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Menu item delete error:', error)
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getMenuData') {
      console.log('Fetching menu data...')
      
      try {
        // Get categories with better error handling
        const { data: categories, error: catError } = await supabaseClient
          .from('menu_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (catError) {
          console.error('Category fetch error:', catError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch categories: ' + catError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Get menu items separately to avoid JOIN issues
        const { data: menuItems, error: itemError } = await supabaseClient
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false })

        if (itemError) {
          console.error('Menu items fetch error:', itemError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch menu items: ' + itemError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Add category information to menu items manually
        const menuItemsWithCategories = (menuItems || []).map(item => {
          const category = (categories || []).find(cat => cat.id === item.category_id)
          return {
            ...item,
            category: category || null
          }
        })

        // Add item counts to categories
        const categoriesWithCounts = (categories || []).map(cat => ({
          ...cat,
          count: (menuItems || []).filter(item => item.category_id === cat.id).length
        }))

        console.log('Successfully fetched:', {
          categories: categoriesWithCounts.length,
          menuItems: menuItemsWithCategories.length
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            categories: categoriesWithCounts, 
            menuItems: menuItemsWithCategories
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
        
      } catch (fetchError) {
        console.error('Menu data fetch error:', fetchError)
        return new Response(
          JSON.stringify({ success: false, error: 'Database fetch failed: ' + fetchError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action: ' + action }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Admin menu service error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Service error: ' + error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})