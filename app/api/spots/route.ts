import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchPlace } from "@/lib/places";

export async function GET() {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { place_name, type, neighborhood, food_recs, personal_note, reel_url } =
    body;

  if (!place_name || !type) {
    return NextResponse.json(
      { error: "place_name and type required" },
      { status: 400 },
    );
  }

  const place = await searchPlace(place_name, neighborhood ?? "").catch(
    () => null,
  );

  const { data, error } = await supabase
    .from("spots")
    .insert({
      place_name,
      type,
      neighborhood: neighborhood ?? null,
      food_recs: food_recs ?? null,
      personal_note: personal_note ?? null,
      reel_url: reel_url ?? null,
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
      place_id: place?.placeId ?? null,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
