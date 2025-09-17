// app/api/reviews/delete/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('[delete-review] invoked, NODE_ENV:', process.env.NODE_ENV);

    const body = await req.json().catch(() => ({}));
    const reviewId = Number(body?.reviewId ?? body?.id ?? 0);

    if (!reviewId) {
      console.log('[delete-review] bad reviewId:', reviewId);
      return NextResponse.json({ success: false, error: 'Invalid reviewId' }, { status: 400 });
    }

    // server-only envs (must be set in Netlify site env)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // safe debug: only presence/length (do NOT log the key itself)
    console.log(
      '[delete-review] SUPABASE_URL present:',
      !!SUPABASE_URL,
      'SERVICE_KEY length:',
      SERVICE_KEY ? SERVICE_KEY.length : 'missing'
    );

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[delete-review] missing SUPABASE_URL or SERVICE_KEY');
      return NextResponse.json({ success: false, error: 'Server configuration error (missing env)' }, { status: 500 });
    }

    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/reviews?id=eq.${reviewId}`;

    const resp = await fetch(restUrl, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const text = await resp.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!resp.ok) {
      console.error('[delete-review] Supabase REST delete failed:', resp.status, json);
      return NextResponse.json({ success: false, error: json?.message || json?.error || json || 'Function error' }, { status: 500 });
    }

    console.log('[delete-review] deleted', Array.isArray(json) ? json.length : json);
    return NextResponse.json({ success: true, deleted: json }, { status: 200 });
  } catch (err) {
    console.error('[delete-review] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
