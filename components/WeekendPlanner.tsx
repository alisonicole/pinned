"use client";

import { useState } from "react";

export default function WeekendPlanner() {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setPlan("");

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput: input }),
    });

    const data = await res.json();
    setPlan(data.plan ?? "Could not generate a plan.");
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          What are you looking for?
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Sunday brunch in the West Village with my roommate, nothing too loud"
          className="w-full border rounded-xl px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors"
      >
        {loading ? "Planning..." : "Plan my weekend"}
      </button>

      {plan && (
        <div className="border rounded-xl p-4 bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {plan}
        </div>
      )}

      {plan && (
        <button
          onClick={handleGenerate}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Regenerate
        </button>
      )}
    </div>
  );
}
