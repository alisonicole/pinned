import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const {
    place_name,
    type,
    neighborhood,
    food_recs,
    personal_note,
    reel_url,
    visited,
  } = body;
  const updates = Object.fromEntries(
    Object.entries({
      place_name,
      type,
      neighborhood,
      food_recs,
      personal_note,
      reel_url,
      visited,
    }).filter(([, v]) => v !== undefined),
  );

  const { data, error } = await supabase
    .from("spots")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await supabase.from("spots").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
