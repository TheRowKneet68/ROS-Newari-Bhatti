// app/api/admins/list/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: "missing_env" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, user_type, phone, is_active, address")
      .or("role.eq.admin,user_type.eq.admin,role.eq.superadmin,user_type.eq.superadmin");

    if (error) {
      console.error("LIST ERROR:", error);
      return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
    }

    const admins = (data ?? []).map((u: any) => {
      let addr: any = {};
      try {
        addr = typeof u.address === "string" ? JSON.parse(u.address) : (u.address || {});
      } catch {
        addr = {};
      }
      return {
        id: u.id,
        email: u.email,
        first_name: u.first_name ?? null,
        last_name: u.last_name ?? null,
        name: (((u.first_name || "") + " " + (u.last_name || "")).trim()) || null,
        role: u.role,
        user_type: u.user_type,
        phone: u.phone,
        is_active: u.is_active,
        address: {
          street: addr.street ?? null,
          city: addr.city ?? null,
          state: addr.state ?? null,
          zip: addr.zip ?? null,
        },
      };
    });

    return NextResponse.json({ success: true, admins }, { status: 200 });
  } catch (err: any) {
    console.error("UNEXPECTED ERROR IN /api/admins/list:", err);
    return NextResponse.json({ success: false, error: "unexpected", message: err?.message ?? String(err) }, { status: 500 });
  }
}
