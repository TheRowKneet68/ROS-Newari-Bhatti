// app/api/owner/orders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_KEY env vars");
}

const supabaseAdmin = createClient(SUPABASE_URL || "", SERVICE_KEY || "", {
  auth: { persistSession: false },
});

const ALLOWED_ROLES = ["owner", "admin", "superadmin"];

function decodeJwtPayload(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

async function isAuthorized(authorizationHeader: string | null) {
  if (!authorizationHeader) return false;
  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  if (token === SERVICE_KEY) return true;

  try {
    // @ts-ignore
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data && data.user) {
      const user = data.user as any;
      const role =
        (user.user_metadata && (user.user_metadata.role || user.user_metadata.userType || user.user_metadata.user_type)) ||
        (user.app_metadata && (user.app_metadata.role || user.app_metadata.userType)) ||
        (user.role as any);
      if (role && ALLOWED_ROLES.includes(String(role).toLowerCase())) return true;
    }
  } catch (e) {
    console.warn("supabase getUser failed:", String(e));
  }

  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const possible =
    payload.role ||
    (payload.user_metadata && (payload.user_metadata.role || payload.user_metadata.userType || payload.user_metadata.user_type)) ||
    (payload.app_metadata && (payload.app_metadata.role || payload.app_metadata.userType)) ||
    payload["user_type"] ||
    payload["userType"] ||
    payload["https://hasura.io/jwt/claims"]?.["x-hasura-role"];

  if (possible && ALLOWED_ROLES.includes(String(possible).toLowerCase())) return true;
  return false;
}

async function fetchOrders() {
  return await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
}

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization) return NextResponse.json({ ok: false, error: "Missing Authorization header" }, { status: 403 });

    const allowed = await isAuthorized(authorization);
    if (!allowed) return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });

    const { data, error } = await fetchOrders();
    if (error) {
      console.error("orders fetch error", error);
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, orders: data || [] });
  } catch (err) {
    console.error("orders GET err", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization) return NextResponse.json({ ok: false, error: "Missing Authorization header" }, { status: 403 });

    const allowed = await isAuthorized(authorization);
    if (!allowed) return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });

    const { data, error } = await fetchOrders();
    if (error) {
      console.error("orders POST fetch error", error);
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, orders: data || [] });
  } catch (err) {
    console.error("orders POST err", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
