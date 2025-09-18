// app/api/orders/list/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Secure orders list:
 * - Verifies Authorization: Bearer <access_token> (preferred)
 * - If token valid, looks up the user's role from `users` table (server-side)
 * - Applies filter: user => only their orders; admin/superadmin => all orders
 * - If no token provided, falls back to client-provided query params (less secure)
 */

export async function GET(req: Request) {
  try {
    const SUPABASE_URL =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE env in /api/orders/list");
      return NextResponse.json({ success: false, error: "missing_env" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    const fallbackRole = url.searchParams.get("role") || "";
    const fallbackUserId = url.searchParams.get("userId") || "";
    const fallbackEmail = url.searchParams.get("email") || "";

    // Try to authenticate via Authorization header
    const authHeader = req.headers.get("authorization") || "";
    let requesterId: string | null = null;
    let requesterEmail: string | null = null;
    let requesterRole: string | null = null;

    if (authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          // validate token using Supabase admin method (service role client)
          // supabase.auth.getUser accepts the access token as parameter
          const { data: userData, error: userErr } = await supabase.auth.getUser(token as string);
          if (!userErr && userData?.user) {
            requesterId = userData.user.id ?? null;
            requesterEmail = (userData.user.email ?? null);
            // Look up role from your users table (source of truth)
            const { data: u, error: uErr } = await supabase
              .from("users")
              .select("role")
              .eq("id", requesterId)
              .maybeSingle();
            if (!uErr && u) {
              requesterRole = (u.role ?? null);
            }
          } else {
            // token invalid or expired
            console.warn("/api/orders/list: token validation failed", userErr);
          }
        } catch (e) {
          console.warn("/api/orders/list: token check threw", e);
        }
      }
    }

    // If token didn't produce role, fall back to client-supplied role (less secure)
    const role = requesterRole ?? fallbackRole;
    const userId = requesterId ?? fallbackUserId;
    const email = requesterEmail ?? fallbackEmail;

    // Build base query
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filtering rules:
    // - user => only their orders (by user_id or email)
    // - admin / superadmin => no filter (see all)
    if (role === "user" || role === "customer") {
      if (userId) {
        query = query.eq("user_id", userId);
      } else if (email) {
        query = query.or(`user_email.eq.${email},customer_email.eq.${email},email.eq.${email}`);
      } else {
        // no identifier -> return empty for safety
        return NextResponse.json({ success: true, orders: [] }, { status: 200 });
      }
    } else {
      // admin/superadmin/other roles -> no extra filter (adjust as needed)
    }

    const { data, error } = await query.limit(1000);
    if (error) {
      console.error("orders/list error:", error);
      return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
    }

    const orders = (data ?? []).map((o: any) => ({
      ...o,
      items:
        typeof o.items === "string"
          ? (() => {
              try { return JSON.parse(o.items); } catch { return []; }
            })()
          : o.items || [],
    }));

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error in /api/orders/list:", err);
    return NextResponse.json({ success: false, error: "unexpected", message: err?.message ?? String(err) }, { status: 500 });
  }
}
