import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSpot, Spot, SpotType } from "@/types/spot";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function parseReelCaption(
  caption: string,
  reelUrl: string,
): Promise<ParsedSpot> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: `You are a location extractor. Given an Instagram Reel caption, extract location info and return ONLY valid JSON with these fields:
- place_name: the name of the place
- type: one of "restaurant", "bar", "coffee", "hike", "other"
- neighborhood: neighborhood or area (e.g. "West Village, NYC")
- food_recs: specific dish or menu item recommendations, or null

Return ONLY the JSON object. No explanation, no markdown.`,
    messages: [
      {
        role: "user",
        content: `Caption: ${caption}\nReel URL: ${reelUrl}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  return {
    place_name:
      typeof parsed.place_name === "string"
        ? parsed.place_name
        : "Unknown Place",
    type: (parsed.type as SpotType) ?? "other",
    neighborhood:
      typeof parsed.neighborhood === "string" ? parsed.neighborhood : "",
    food_recs: typeof parsed.food_recs === "string" ? parsed.food_recs : null,
  };
}

export async function generateWeekendPlan(
  spots: Spot[],
  userInput: string,
): Promise<string> {
  const client = getClient();
  const spotsContext = spots
    .filter((s) => !s.visited)
    .map(
      (s) =>
        `- ${s.place_name} (${s.type}, ${s.neighborhood})${s.food_recs ? ` - try: ${s.food_recs}` : ""}${s.personal_note ? ` - note: ${s.personal_note}` : ""}`,
    )
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are a local weekend planner. You have access to someone's saved spots list. Build a realistic, sequenced weekend itinerary using ONLY spots from their saved list. Format as a clean day plan with approximate times. Be specific - mention the spot name, what to order or do there, and why it fits the vibe they described.`,
    messages: [
      {
        role: "user",
        content: `Saved spots:\n${spotsContext}\n\nWhat I'm looking for: ${userInput}`,
      },
    ],
  });

  return message.content[0].type === "text"
    ? message.content[0].text
    : "Could not generate a plan.";
}
