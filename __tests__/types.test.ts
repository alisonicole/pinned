import type { Spot, ParsedSpot, SpotType } from "@/types/spot";

test("SpotType covers expected values", () => {
  const types: SpotType[] = ["restaurant", "bar", "coffee", "hike", "other"];
  expect(types).toHaveLength(5);
});

test("Spot shape has required fields", () => {
  const spot: Spot = {
    id: "abc",
    place_name: "Test Place",
    type: "restaurant",
    neighborhood: "West Village",
    food_recs: null,
    personal_note: null,
    reel_url: "https://instagram.com/reel/abc",
    lat: 40.7,
    lng: -74.0,
    visited: false,
    created_at: "2026-04-21T00:00:00Z",
  };
  expect(spot.place_name).toBe("Test Place");
});
