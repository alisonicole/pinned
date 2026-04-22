export async function geocodeNeighborhood(
  neighborhood: string,
): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  const encoded = encodeURIComponent(neighborhood);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results.length) return null;

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}
