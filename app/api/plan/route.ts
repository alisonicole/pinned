import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateWeekendPlan } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { userInput } = await req.json();

  if (!userInput) {
    return NextResponse.json({ error: "userInput required" }, { status: 400 });
  }

  const { data: spots, error } = await supabase
    .from("spots")
    .select("*")
    .limit(50);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    const plan = await generateWeekendPlan(spots, userInput);
    return NextResponse.json({ plan });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
