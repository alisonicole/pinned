import type { Spot, SpotType } from "@/types/spot";

const TYPE_COLORS: Record<SpotType, string> = {
  restaurant: "bg-red-100 text-red-700",
  bar: "bg-purple-100 text-purple-700",
  coffee: "bg-amber-100 text-amber-700",
  hike: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-700",
};

interface SpotCardProps {
  spot: Spot;
  onMarkVisited: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SpotCard({
  spot,
  onMarkVisited,
  onDelete,
}: SpotCardProps) {
  return (
    <div
      className={`border rounded-xl p-4 space-y-2 ${spot.visited ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{spot.place_name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[spot.type as SpotType] ?? "bg-gray-100 text-gray-700"}`}
        >
          {spot.type}
        </span>
      </div>

      <p className="text-sm text-gray-500">{spot.neighborhood}</p>

      {spot.food_recs && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">Try:</span> {spot.food_recs}
        </p>
      )}

      {spot.personal_note && (
        <p className="text-sm text-gray-600 italic">{spot.personal_note}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <a
          href={spot.reel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          View Reel
        </a>
        {!spot.visited && (
          <button
            onClick={() => onMarkVisited(spot.id)}
            className="text-xs text-green-600 hover:underline"
          >
            Mark visited
          </button>
        )}
        <button
          onClick={() => onDelete(spot.id)}
          className="text-xs text-red-400 hover:underline ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
