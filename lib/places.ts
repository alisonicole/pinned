interface PlaceResult {
  lat: number;
  lng: number;
  placeId: string;
}

export async function searchPlace(
  name: string,
  neighborhood: string,
): Promise<PlaceResult | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) throw new Error("GOOGLE_GEOCODING_API_KEY is not set");

  const query = encodeURIComponent(`${name} ${neighborhood}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const first = data.results?.[0];
  if (!first) return null;

  return {
    lat: first.geometry.location.lat,
    lng: first.geometry.location.lng,
    placeId: first.place_id,
  };
}
