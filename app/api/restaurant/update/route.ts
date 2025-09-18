// app/api/restaurant/update/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('/api/restaurant/update body:', JSON.stringify(body));

    const { id, updates } = body;
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'missing_updates' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
      return NextResponse.json({ success: false, error: 'missing_env' }, { status: 500 });
    }

    // SERVICE ROLE client (server-only) — bypasses RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If id present, update that row; otherwise insert new row
    if (id !== undefined && id !== null && id !== '') {
      const { data, error } = await supabase
        .from('restaurant_info')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
      }

      return NextResponse.json({ success: true, restaurant: data }, { status: 200 });
    } else {
      const { data, error } = await supabase
        .from('restaurant_info')
        .insert([updates])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
      }

      return NextResponse.json({ success: true, restaurant: data }, { status: 200 });
    }
  } catch (err: any) {
    console.error('Unexpected error in /api/restaurant/update:', err);
    return NextResponse.json({ success: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
