import { NextRequest, NextResponse } from "next/server";
import { parseReelCaption } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { caption, reel_url } = await req.json();

  if (!caption || !reel_url) {
    return NextResponse.json(
      { error: "caption and reel_url required" },
      { status: 400 },
    );
  }

  try {
    const parsed = await parseReelCaption(caption, reel_url);
    return NextResponse.json(parsed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to parse caption";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
