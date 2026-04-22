"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function ConfirmForm() {
  const params = useSearchParams();
  const router = useRouter();

  const captionParam = params.get("caption") ?? "";
  const reelUrl = params.get("reel_url") ?? "";

  const [caption, setCaption] = useState(captionParam);
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

  async function handleParse() {
    if (!caption) return;
    setParsing(true);
    const res = await fetch("/api/parse-reel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, reel_url: reelUrl }),
    });
    const data = await res.json();
    if (!data.error) {
      setForm((prev) => ({
        ...prev,
        place_name: data.place_name ?? "",
        type: data.type ?? "other",
        neighborhood: data.neighborhood ?? "",
        food_recs: data.food_recs ?? "",
      }));
    } else {
      alert(data.error);
    }
    setParsing(false);
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/spots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Describe the place
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="e.g. Amazing udon spot in East Village, get the miso udon"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <button
        onClick={handleParse}
        disabled={parsing || !caption}
        className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-40"
      >
        {parsing ? "Parsing..." : "Parse with Claude"}
      </button>

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
        disabled={saving || !form.place_name || !form.neighborhood}
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
