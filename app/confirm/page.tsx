"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function ConfirmForm() {
  const params = useSearchParams();
  const router = useRouter();

  const caption = params.get("caption") ?? "";
  const reelUrl = params.get("reel_url") ?? "";

  const [form, setForm] = useState({
    place_name: "",
    type: "other",
    neighborhood: "",
    food_recs: "",
    personal_note: "",
    reel_url: reelUrl,
  });

  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!caption) return;
    setParsing(true);
    fetch("/api/parse-reel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, reel_url: reelUrl }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setForm((prev) => ({
            ...prev,
            place_name: data.place_name ?? "",
            type: data.type ?? "other",
            neighborhood: data.neighborhood ?? "",
            food_recs: data.food_recs ?? "",
          }));
        }
      })
      .finally(() => setParsing(false));
  }, [caption]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-2xl">Saved</p>
          <p className="text-gray-500 text-sm">
            {form.place_name} added to your spots.
          </p>
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

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Save this spot</h1>

      {parsing && (
        <p className="text-sm text-gray-500">Parsing with Claude...</p>
      )}

      {[
        { label: "Place name", field: "place_name" },
        { label: "Neighborhood", field: "neighborhood" },
        { label: "Food recs", field: "food_recs" },
        { label: "Your note", field: "personal_note" },
      ].map(({ label, field }) => (
        <div key={field} className="space-y-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <input
            value={form[field as keyof typeof form]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Type</label>
        <select
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          {["restaurant", "bar", "coffee", "hike", "other"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || parsing || !form.place_name || !form.neighborhood}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save spot"}
      </button>
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
