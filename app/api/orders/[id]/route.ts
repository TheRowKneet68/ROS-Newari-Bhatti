// app/api/orders/public/[token]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  // Response with helpful message in dev - in production you should set env vars.
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in server environment');
}

const supabaseAdmin = createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '');

export async function GET(
  request: Request,
  { params }: { params: { token?: string } }
) {
  const token = params.token;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    // Fetch order by public_token. Use single() to ensure we only return one result.
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('public_token', token)
      .single();

    if (error) {
      // Could be not_found or other DB error
      console.error('Supabase admin fetch error:', error);
      // if not found, return 404
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Optionally you may want to trim sensitive fields before returning (e.g., payment gateway tokens)
    // Example: delete order.payment_gateway_token
    // return JSON
    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    console.error('Unexpected server error fetching public order:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
