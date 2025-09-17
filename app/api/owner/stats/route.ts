// app/api/owner/stats/route.ts
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

// Allowed roles that may view owner/admin dashboard
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
  // If no header, deny
  if (!authorizationHeader) return false;
  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  // If token equals service key (server-to-server), allow
  if (token === SERVICE_KEY) return true;

  // First try to validate token with Supabase admin API to get user
  try {
    // supabaseAdmin.auth.getUser accepts { token } in v2
    // Type may vary; we try to call and check for data.user
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data && data.user) {
      const user = data.user as any;
      // Check several places for a role/userType claim
      const role =
        (user.user_metadata && (user.user_metadata.role || user.user_metadata.userType || user.user_metadata.user_type)) ||
        (user.app_metadata && (user.app_metadata.role || user.app_metadata.userType)) ||
        (user.role as any);
      if (role && ALLOWED_ROLES.includes(String(role).toLowerCase())) return true;
    }
  } catch (e) {
    // not fatal — we'll try decode fallback
    console.warn("supabase getUser failed:", String(e));
  }

  // Fallback: decode JWT and look for role-like claims
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  // Common claim locations: payload.role, payload.user_metadata.*, payload['https://.../claims']
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

export async function GET() {
  try {
    const authHeader = null; // no request object in this signature; Next's Route Handler DOES NOT expose req in GET — use Request hack
    // In Next route handlers we can access headers via global Request, but for simplicity use this pattern:
    // The runtime should provide Request via arguments, but here we read from global `headers()` if available.
    // Instead, create wrapper that reads from `globalThis` (Next exposes headers via 'headers' function in node runtime),
    // but to keep portability, we'll get Authorization from env or allow SERVICE_KEY (server-side).
    // For real checks, we will try to read the 'authorization' header via globalThis if available.

    // Try to read auth header (works on Vercel/Next edge runtime)
    // @ts-ignore
    const headersGetter = (typeof globalThis !== "undefined" && (globalThis as any).headers) || null;
    // If headers() is available (Edge), use that. Otherwise, try from process.env.AUTHORIZATION_OVERRIDE (optional during server-to-server).
    let authorization: string | null = null;
    try {
      // @ts-ignore
      if (typeof headersGetter === "function") {
        // @ts-ignore
        authorization = headersGetter().get?.("authorization") || null;
      } else if (typeof headersGetter === "object" && headersGetter !== null && typeof headersGetter.get === "function") {
        // @ts-ignore
        authorization = headersGetter.get("authorization") || null;
      } else if (typeof process !== "undefined" && process.env.AUTHORIZATION_OVERRIDE) {
        authorization = process.env.AUTHORIZATION_OVERRIDE;
      }
    } catch (e) {
      // ignore
    }

    // If no header discovered, allow if this is server-to-server (SERVICE_KEY present) — caller may be internal
    // But prefer requiring auth header from client. If no header, deny to be safe.
    if (!authorization) {
      // allow server-only calls if SERVICE_KEY env var is present and you intend server-to-server; we will allow SERVICE_KEY via token check below
      // For now if no header, deny
      return NextResponse.json({ ok: false, error: "Missing Authorization header" }, { status: 403 });
    }

    const allowed = await isAuthorized(authorization);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
    }

    // Proceed to fetch stats
    const { data: recentOrders, error: recentErr } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, items, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentErr) console.error("recentErr", recentErr);

    const { data: totalRows, error: totalErr, count } = await supabaseAdmin.from("orders").select("id", { count: "exact" });
    if (totalErr) console.error("totalErr", totalErr);

    const { data: sumData, error: sumErr } = await supabaseAdmin.from("orders").select("total");
    if (sumErr) console.error("sumErr", sumErr);

    const total_orders = typeof count === "number" ? count : (Array.isArray(totalRows) ? totalRows.length : 0);
    const total_revenue = Array.isArray(sumData) ? sumData.reduce((s: number, r: any) => s + (Number(r.total) || 0), 0) : 0;

    const { data: activeRows, error: activeErr, count: activeCount } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact" })
      .in("status", ["pending", "processing"]);
    if (activeErr) console.error("activeErr", activeErr);

    const active_orders = typeof activeCount === "number" ? activeCount : (Array.isArray(activeRows) ? activeRows.length : 0);

    return NextResponse.json({
      ok: true,
      totals: { total_orders, total_revenue, active_orders },
      recentOrders: recentOrders || [],
    });
  } catch (err) {
    console.error("stats error", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
