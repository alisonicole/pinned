import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geocodeNeighborhood } from "@/lib/geocode";

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

  if (!place_name || !type || !neighborhood || !reel_url) {
    return NextResponse.json(
      { error: "place_name, type, neighborhood, reel_url required" },
      { status: 400 },
    );
  }

  const coords = await geocodeNeighborhood(neighborhood);

  const { data, error } = await supabase
    .from("spots")
    .insert({
      place_name,
      type,
      neighborhood,
      food_recs: food_recs ?? null,
      personal_note: personal_note ?? null,
      reel_url,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
