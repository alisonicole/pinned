import { parseReelCaption, generateWeekendPlan } from "@/lib/claude";
import type { Spot } from "@/types/spot";

jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              place_name: "Don Angie",
              type: "restaurant",
              neighborhood: "West Village, NYC",
              food_recs: "pinwheel lasagna",
            }),
          },
        ],
      }),
    },
  })),
}));

test("parseReelCaption returns structured spot data", async () => {
  const result = await parseReelCaption(
    "You NEED to try Don Angie in the West Village. The pinwheel lasagna is unreal.",
    "https://instagram.com/reel/abc",
  );
  expect(result.place_name).toBe("Don Angie");
  expect(result.type).toBe("restaurant");
  expect(result.neighborhood).toBe("West Village, NYC");
  expect(result.food_recs).toBe("pinwheel lasagna");
});

test("generateWeekendPlan returns a string", async () => {
  const spots: Spot[] = [
    {
      id: "1",
      place_name: "Don Angie",
      type: "restaurant",
      neighborhood: "West Village, NYC",
      food_recs: "pinwheel lasagna",
      personal_note: null,
      reel_url: "https://instagram.com/reel/abc",
      lat: 40.733,
      lng: -74.002,
      visited: false,
      created_at: "2026-04-21T00:00:00Z",
    },
  ];
  const result = await generateWeekendPlan(spots, "Sunday dinner");
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(0);
});
