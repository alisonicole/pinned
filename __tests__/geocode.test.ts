import { geocodeNeighborhood } from "@/lib/geocode";

global.fetch = jest.fn();

beforeEach(() => {
  process.env.GOOGLE_GEOCODING_API_KEY = "test-key";
});

test("returns lat/lng for a valid neighborhood", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      status: "OK",
      results: [{ geometry: { location: { lat: 40.733, lng: -74.002 } } }],
    }),
  });

  const result = await geocodeNeighborhood("West Village, NYC");
  expect(result).toEqual({ lat: 40.733, lng: -74.002 });
});

test("returns null when geocoding fails", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: "ZERO_RESULTS", results: [] }),
  });

  const result = await geocodeNeighborhood("nonexistent place xyz");
  expect(result).toBeNull();
});

test("returns null on HTTP error", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => ({}),
  });

  const result = await geocodeNeighborhood("West Village, NYC");
  expect(result).toBeNull();
});
