import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateOrderId() {
  return 'NB-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
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

    const { action, orderId, orderData, userId, status } = await req.json()
    console.log('Order service called with action:', action)

    // Get current user from JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('User from JWT:', user?.id, 'Error:', userError)
    
    if (action === 'createOrder') {
      console.log('Creating order with data:', orderData)
      const newOrderId = generateOrderId()
      
      const orderInsertData = {
        id: newOrderId,
        user_id: user?.id || userId || null,
        customer_first_name: orderData.customer?.firstName || '',
        customer_last_name: orderData.customer?.lastName || '',
        customer_email: orderData.customer?.email || '',
        customer_phone: orderData.customer?.phone || '',
        order_type: orderData.orderType || 'pickup',
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        delivery_fee: orderData.deliveryFee || 0,
        tax: orderData.tax || 0,
        total: orderData.total || 0,
        payment_method: orderData.paymentMethod || 'Cash on Delivery',
        delivery_address: orderData.orderType === 'delivery' ? JSON.stringify(orderData.address) : null,
        special_instructions: orderData.specialInstructions || null,
        estimated_time: orderData.estimatedTime || 30,
        status: 'placed'
      }

      console.log('Inserting order data:', orderInsertData)

      const { data: newOrder, error } = await supabaseClient
        .from('orders')
        .insert(orderInsertData)
        .select()
        .single()

      if (error) {
        console.error('Order insert error:', error)
        throw error
      }

      console.log('Order created successfully:', newOrder)

      return new Response(
        JSON.stringify({ success: true, order: newOrder }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getOrders') {
      console.log('Getting orders for user:', user?.id)
      
      // Check if user is admin
      const { data: userData, error: userDataError } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

      console.log('User role data:', userData, 'Error:', userDataError)

      let query = supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // If not admin, only show user's own orders
      if (!userData || !['admin', 'superadmin'].includes(userData.role)) {
        query = query.eq('user_id', user?.id || 'no-user')
        console.log('Filtering orders for user:', user?.id || 'no-user')
      } else {
        console.log('User is admin, showing all orders')
      }

      const { data: orders, error } = await query

      if (error) {
        console.error('Orders fetch error:', error)
        throw error
      }

      // Parse delivery address from JSON string
      const ordersWithParsedAddress = orders?.map(order => ({
        ...order,
        delivery_address: order.delivery_address ? 
          (typeof order.delivery_address === 'string' ? 
            JSON.parse(order.delivery_address) : 
            order.delivery_address) : 
          null
      })) || []

      console.log('Orders fetched:', ordersWithParsedAddress?.length || 0)

      return new Response(
        JSON.stringify({ success: true, orders: ordersWithParsedAddress }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getOrder') {
      console.log('Getting order:', orderId)
      
      const { data: order, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Order fetch error:', error)
        throw error
      }

      // Parse delivery address from JSON string
      const orderWithParsedAddress = {
        ...order,
        delivery_address: order.delivery_address ? 
          (typeof order.delivery_address === 'string' ? 
            JSON.parse(order.delivery_address) : 
            order.delivery_address) : 
          null
      }

      console.log('Order fetched:', orderWithParsedAddress)

      return new Response(
        JSON.stringify({ success: true, order: orderWithParsedAddress }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updateOrderStatus') {
      console.log('Updating order status:', orderId, 'to:', status)
      
      // Check if user is admin
      const { data: userData, error: userDataError } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

      if (!userData || !['admin', 'superadmin'].includes(userData.role)) {
        throw new Error('Unauthorized: Only admins can update order status')
      }

      const { data: updatedOrder, error } = await supabaseClient
        .from('orders')
        .update({
          status: status,
          updated_at: new Date().toISOString(),
          actual_delivery_time: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Order update error:', error)
        throw error
      }

      console.log('Order status updated:', updatedOrder)

      return new Response(
        JSON.stringify({ success: true, order: updatedOrder }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action: ' + action }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Order service error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})