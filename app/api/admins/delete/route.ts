// app/api/admins/delete/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: "missing_id" }, { status: 400 });

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("MISSING ENV: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ success: false, error: "missing_env" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // delete from users table (or set is_active=false depending on your policy)
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete admin:", error);
      return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
    }

    // Optionally remove auth user from Supabase (admin API)
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (e) {
      console.warn("Failed to delete auth user (non-fatal):", e);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error in /api/admins/delete:", err);
    return NextResponse.json({ success: false, error: "unexpected", message: err?.message ?? String(err) }, { status: 500 });
  }
}
