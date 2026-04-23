import { NextRequest, NextResponse } from "next/server";
import { parseReelCaption } from "@/lib/claude";

export async function POST(req: NextRequest) {
  let caption: string | undefined;
  let reel_url: string | undefined;

  try {
    const body = await req.json();
    caption = body.caption;
    reel_url = body.reel_url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!caption) {
    return NextResponse.json({ error: "caption is required" }, { status: 400 });
  }

  try {
    const parsed = await parseReelCaption(caption, reel_url ?? "");
    return NextResponse.json(parsed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to parse caption";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
