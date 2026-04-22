export async function geocodeNeighborhood(
  neighborhood: string,
): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) throw new Error("GOOGLE_GEOCODING_API_KEY is not set");

  const encoded = encodeURIComponent(neighborhood);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK" || !data.results.length) return null;

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}
