"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import type { SpotType } from "@/types/spot";

const TYPES: SpotType[] = ["restaurant", "bar", "coffee", "hike", "other"];

const TYPE_COLORS: Record<SpotType, string> = {
  restaurant: "bg-red-100 text-red-700 border-red-200",
  bar: "bg-purple-100 text-purple-700 border-purple-200",
  coffee: "bg-amber-100 text-amber-700 border-amber-200",
  hike: "bg-green-100 text-green-700 border-green-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

interface ParsedForm {
  place_name: string;
  neighborhood: string;
  food_recs: string;
  type: SpotType;
}

function ConfirmForm() {
  const params = useSearchParams();
  const router = useRouter();

  const captionParam = params.get("caption") ?? "";
  const reelUrl = params.get("reel_url") ?? "";

  const [step, setStep] = useState<"input" | "confirm">("input");
  const [description, setDescription] = useState(captionParam);
  const [parsing, setParsing] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<ParsedForm>({
    place_name: "",
    neighborhood: "",
    food_recs: "",
    type: "restaurant",
  });
  const [note, setNote] = useState("");

  async function handleNext() {
    if (!description.trim()) return;
    setParsing(true);

    const parsed = await fetch("/api/parse-reel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: description, reel_url: reelUrl }),
    }).then((r) => r.json());

    const placeName = parsed.place_name ?? "";
    let neighborhood = parsed.neighborhood ?? "";

    if (placeName && !neighborhood) {
      const lookup = await fetch("/api/lookup-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: placeName }),
      }).then((r) => r.json());
      neighborhood = lookup.neighborhood ?? "";
    }

    setForm({
      place_name: placeName,
      neighborhood,
      food_recs: parsed.food_recs ?? "",
      type: parsed.type ?? "restaurant",
    });

    setParsing(false);
    setStep("confirm");
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_name: form.place_name,
        type: form.type,
        neighborhood: form.neighborhood,
        food_recs: form.food_recs || null,
        personal_note: note || null,
        reel_url: reelUrl || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to save spot");
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-3xl">Pinned</p>
          <p className="text-gray-500 text-sm">{form.place_name} saved.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 underline"
          >
            View all spots
          </button>
        </div>
      </div>
    );
  }

  if (step === "input") {
    return (
      <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col gap-6 pt-16">
        <div>
          <p className="text-xs text-green-600 font-mono">v2</p>
          <h1 className="text-2xl font-semibold text-gray-900">Where is it?</h1>
          <p className="text-sm text-gray-400 mt-1">
            Any format works — a name, a neighborhood, a vibe.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="e.g. that udon place on St. Marks, or Kopitiam in Lower East Side"
          autoFocus
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />

        <button
          onClick={handleNext}
          disabled={parsing || !description.trim()}
          className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
        >
          {parsing ? "Asking Claude..." : "Next"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col gap-4 pt-10">
      <h1 className="text-xl font-semibold text-gray-900">Confirm spot</h1>

      <div className="space-y-3">
        {(
          [
            { label: "Place", key: "place_name" },
            { label: "Neighborhood", key: "neighborhood" },
            { label: "What to try", key: "food_recs" },
          ] as { label: string; key: keyof ParsedForm }[]
        ).map(({ label, key }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {label}
            </label>
            <input
              value={form[key] as string}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Type
          </label>
          {typeOpen ? (
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, type: t }));
                    setTypeOpen(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium ${TYPE_COLORS[t]}`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setTypeOpen(true)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${TYPE_COLORS[form.type]}`}
            >
              {form.type}
            </button>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Your note
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setStep("input")}
          className="flex-1 border rounded-xl py-3 text-sm font-medium text-gray-600"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.place_name}
          className="flex-2 flex-grow bg-gray-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save spot"}
        </button>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmForm />
    </Suspense>
  );
}
