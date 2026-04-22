"use client";

import { useState } from "react";
import SpotCard from "./SpotCard";
import type { Spot, SpotType } from "@/types/spot";

const SPOT_TYPES: SpotType[] = ["restaurant", "bar", "coffee", "hike", "other"];

interface SpotGridProps {
  spots: Spot[];
  onMarkVisited: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SpotGrid({
  spots,
  onMarkVisited,
  onDelete,
}: SpotGridProps) {
  const [typeFilter, setTypeFilter] = useState<SpotType | "all">("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [unvisitedOnly, setUnvisitedOnly] = useState(false);

  const neighborhoods = Array.from(
    new Set(spots.map((s) => s.neighborhood)),
  ).sort();

  const filtered = spots.filter((s) => {
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (neighborhoodFilter && s.neighborhood !== neighborhoodFilter)
      return false;
    if (unvisitedOnly && s.visited) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SpotType | "all")}
          className="text-sm border rounded-lg px-3 py-1.5"
        >
          <option value="all">All types</option>
          {SPOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5"
        >
          <option value="">All neighborhoods</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={unvisitedOnly}
            onChange={(e) => setUnvisitedOnly(e.target.checked)}
          />
          Unvisited only
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No spots match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onMarkVisited={onMarkVisited}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
