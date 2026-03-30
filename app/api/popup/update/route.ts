import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { image_url, is_active } = await req.json();

  // get existing row
  const { data: existing } = await supabase
    .from("popup_notice")
    .select("id")
    .limit(1)
    .single();

  let result;

  if (existing) {
    // UPDATE
    result = await supabase
      .from("popup_notice")
      .update({ image_url, is_active })
      .eq("id", existing.id);
  } else {
    // INSERT (only first time)
    result = await supabase
      .from("popup_notice")
      .insert([{ image_url, is_active }]);
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}