// app/api/delete-account/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // This will cause deploy-time error if not set, but keep an explicit check.
  throw new Error('Missing Supabase config on server: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * POST body: { userId: string }
 * Authorization header: 'Bearer <access_token>' (client session token) - used to verify caller owns userId
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const body = await request.json();
    const userId: string | undefined = body?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 });
    }

    // 1) Verify token corresponds to the same user (so a user can only delete their own account)
    // Using admin client: getUser(token) returns data.user
    const { data: tokenData, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
    if (tokenErr) {
      console.error('Token verification error', tokenErr);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const authUser = (tokenData as any)?.user ?? (tokenData as any)?.user ?? null;
    // Note: depending on supabase-js version tokenData might be { data: { user } } or { user }, but above covers typical shape.
    const tokenUserId = authUser?.id ?? authUser?.user?.id ?? null;

    if (!tokenUserId || tokenUserId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this account' }, { status: 403 });
    }

    // 2) Delete the auth user using the admin API (permanently remove from Auth)
    // Note: admin.deleteUser may differ by client version; this is the typical v2 call.
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      console.error('Failed to delete auth user', deleteAuthErr);
      return NextResponse.json({ error: deleteAuthErr.message || 'Failed to delete auth user' }, { status: 500 });
    }

    // 3) Delete the row in the users table (server side)
    const { error: deleteRowErr } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (deleteRowErr) {
      console.error('Failed to delete users row', deleteRowErr);
      // note: auth user is gone, but users row couldn't be deleted — still return success but warn.
      return NextResponse.json({ error: deleteRowErr.message || 'Auth deleted but users row delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('delete-account route error', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
