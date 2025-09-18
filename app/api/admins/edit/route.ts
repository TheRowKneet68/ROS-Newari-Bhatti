// app/api/admins/edit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log("/api/admins/edit body:", JSON.stringify(body));

    const {
      id,
      email,
      first_name = null,
      last_name = null,
      phone = null,
      role = null,
      user_type = null,
      password = null,
      gender = null,
      date_of_birth = null,
      address, // expect object or null or undefined
    } = body;

    if (!id) return NextResponse.json({ success: false, error: "missing_id" }, { status: 400 });

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: "missing_env" }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update Auth if password/email provided (non-fatal if fails)
    if (password || email) {
      try {
        if ((supabase as any).auth?.admin?.updateUserById) {
          await (supabase as any).auth.admin.updateUserById(id, {
            password: password ?? undefined,
            email: email ?? undefined,
          });
        } else if ((supabase as any).auth?.admin?.updateUser) {
          await (supabase as any).auth.admin.updateUser(id, { password: password ?? undefined, email: email ?? undefined });
        }
      } catch (e) {
        console.warn("Auth update failed (non-fatal):", e);
      }
    }

    // Build updates for users table
    const updates: any = {};
    if (first_name !== null) updates.first_name = first_name;
    if (last_name !== null) updates.last_name = last_name;
    if (phone !== null) updates.phone = phone;
    if (role !== null) updates.role = role;
    if (user_type !== null) updates.user_type = user_type;
    if (gender !== null) updates.gender = gender;
    if (date_of_birth !== null) updates.date_of_birth = date_of_birth;

    // CRITICAL: update address when provided (even if explicitly null)
    if (typeof address !== "undefined") {
      // accept stringified JSON too
      if (typeof address === "string") {
        try { updates.address = JSON.parse(address); } catch { updates.address = null; }
      } else {
        updates.address = address;
      }
    }

    let updatedRow: any = null;
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("UPDATE ERROR:", error);
        return NextResponse.json({ success: false, error: error.message ?? error }, { status: 500 });
      }
      updatedRow = data;
    }

    return NextResponse.json({ success: true, user: updatedRow }, { status: 200 });
  } catch (err: any) {
    console.error("UNEXPECTED ERROR IN /api/admins/edit:", err);
    return NextResponse.json({ success: false, error: "unexpected", message: err?.message ?? String(err) }, { status: 500 });
  }
}
