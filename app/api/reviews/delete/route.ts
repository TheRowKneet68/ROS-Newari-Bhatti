// app/api/reviews/delete/route.ts  (temporary debug version)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('[delete-review] invoked, NODE_ENV:', process.env.NODE_ENV);

    const body = await req.json().catch(() => ({}));
    const reviewId = Number(body?.reviewId ?? body?.id ?? 0);
    console.log('[delete-review] parsed reviewId:', reviewId);

    if (!reviewId) {
      console.log('[delete-review] invalid reviewId');
      return NextResponse.json({ success: false, error: 'Invalid reviewId' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[delete-review] SUPABASE_URL present:', !!SUPABASE_URL, 'SERVICE_KEY length:', SERVICE_KEY ? SERVICE_KEY.length : 'missing');

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[delete-review] missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ success: false, error: 'Server configuration error (missing env)' }, { status: 500 });
    }

    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/reviews?id=eq.${reviewId}`;
    console.log('[delete-review] calling supabase rest url:', restUrl);

    const resp = await fetch(restUrl, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const text = await resp.text().catch(() => '');
    console.log('[delete-review] supabase status:', resp.status, 'body:', text);

    if (!resp.ok) {
      // return server-visible body so client sees exact message
      return NextResponse.json({ success: false, error: text || 'Supabase error', status: resp.status }, { status: 500 });
    }

    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }

    console.log('[delete-review] delete succeeded, deleted:', json);
    return NextResponse.json({ success: true, deleted: json }, { status: 200 });
  } catch (err) {
    console.error('[delete-review] Unexpected error (stack):', err);
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
