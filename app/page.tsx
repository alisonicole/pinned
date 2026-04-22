"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SpotGrid from "@/components/SpotGrid";
import WeekendPlanner from "@/components/WeekendPlanner";
import type { Spot } from "@/types/spot";

const SpotMap = dynamic(() => import("@/components/SpotMap"), { ssr: false });

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [activeTab, setActiveTab] = useState<"spots" | "plan">("spots");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  useEffect(() => {
    fetch("/api/spots")
      .then((r) => r.json())
      .then(setSpots);
  }, []);

  const handleMarkVisited = useCallback(async (id: string) => {
    await fetch(`/api/spots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visited: true }),
    });
    setSpots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visited: true } : s)),
    );
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/spots/${id}`, { method: "DELETE" });
    setSpots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Pinned</h1>
        <span className="text-sm text-gray-400">
          {spots.length} spots saved
        </span>
      </header>

      <div className="flex border-b px-6">
        {(["spots", "plan"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "spots" ? "My Spots" : "Plan Weekend"}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {activeTab === "spots" && (
          <>
            <SpotMap spots={spots} onSpotSelect={setSelectedSpot} />

            {selectedSpot && (
              <div className="border rounded-xl p-4 bg-blue-50 text-sm">
                <strong>{selectedSpot.place_name}</strong> -{" "}
                {selectedSpot.neighborhood}
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  Dismiss
                </button>
              </div>
            )}

            <SpotGrid
              spots={spots}
              onMarkVisited={handleMarkVisited}
              onDelete={handleDelete}
            />
          </>
        )}

        {activeTab === "plan" && <WeekendPlanner />}
      </div>
    </main>
  );
}
