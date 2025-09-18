// app/api/admins/add/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // debug log - remove in production if desired
    console.log("/api/admins/add body:", JSON.stringify(body));

    const {
      first_name = null,
      last_name = null,
      email,
      password,
      phone = null,
      role = "admin",
      user_type = "admin",
      gender = null,
      date_of_birth = null,
      address = null,
      address_street = null,
      address_city = null,
      address_state = null,
      address_zip_code = null,
    } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "missing_email_or_password" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("MISSING ENV: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ success: false, error: "missing_env" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build address JSON robustly (accept object or flat fields)
    let addr: any = null;
    if (typeof address === "string") {
      try { addr = JSON.parse(address); } catch { addr = null; }
    } else if (typeof address === "object" && address !== null) {
      addr = address;
    } else if (address_street || address_city || address_state || address_zip_code) {
      addr = {
        street: address_street ?? null,
        city: address_city ?? null,
        state: address_state ?? null,
        zip: address_zip_code ?? null,
      };
    } else {
      addr = null;
    }

    console.log("/api/admins/add resolved addr:", JSON.stringify(addr));

    // Create supabase auth user using admin key
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      console.error("AUTH CREATE ERROR:", authError);
      return NextResponse.json({ success: false, step: "createUser", error: authError.message ?? authError }, { status: 500 });
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "createUser_no_id" }, { status: 500 });
    }

    const userRow: any = {
      id: userId,
      email,
      first_name,
      last_name,
      phone,
      role: role || "admin",
      user_type: user_type || role || "admin",
      gender,
      date_of_birth,
      address: addr,
      is_active: true,
    };

    const { data: insertedUser, error: insertErr } = await supabase
      .from("users")
      .upsert([userRow], { onConflict: "email" })
      .select()
      .single();

    if (insertErr) {
      console.error("UPSERT ERROR:", insertErr);
      return NextResponse.json({ success: false, step: "upsert_users", error: insertErr.message ?? insertErr }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, user: insertedUser }, { status: 200 });
  } catch (err: any) {
    console.error("UNEXPECTED ERROR IN /api/admins/add:", err);
    return NextResponse.json({ success: false, error: "unexpected", message: err?.message ?? String(err) }, { status: 500 });
  }
}
