import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "name required" }, { status: 400 });

  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key)
    return NextResponse.json({ error: "API key not set" }, { status: 500 });

  const query = encodeURIComponent(name);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok)
    return NextResponse.json({ error: "Places API failed" }, { status: 502 });

  const data = await res.json();
  const place = data.results?.[0];
  if (!place) return NextResponse.json({ neighborhood: null });

  const components: { types: string[]; long_name: string }[] =
    place.address_components ?? [];

  const find = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ??
    null;

  const neighborhood =
    find("neighborhood") ??
    find("sublocality_level_1", "sublocality") ??
    find("locality");

  return NextResponse.json({
    neighborhood,
    lat: place.geometry?.location?.lat ?? null,
    lng: place.geometry?.location?.lng ?? null,
    place_id: place.place_id ?? null,
  });
}
