"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { Spot, SpotType } from "@/types/spot";

const TYPE_COLORS: Record<SpotType, string> = {
  restaurant: "#ef4444",
  bar: "#8b5cf6",
  coffee: "#f59e0b",
  hike: "#22c55e",
  other: "#6b7280",
};

interface SpotMapProps {
  spots: Spot[];
  onSpotSelect: (spot: Spot) => void;
}

export default function SpotMap({ spots, onSpotSelect }: SpotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });

    importLibrary("maps").then(() => {
      if (!mapRef.current) return;
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });
      setMapReady(true);
    });
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    spots
      .filter((s) => s.lat && s.lng)
      .forEach((spot) => {
        const marker = new google.maps.Marker({
          position: { lat: spot.lat!, lng: spot.lng! },
          map: mapInstanceRef.current!,
          title: spot.place_name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: TYPE_COLORS[spot.type as SpotType] ?? "#6b7280",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () => onSpotSelect(spot));
        markersRef.current.push(marker);
      });
  }, [spots, onSpotSelect, mapReady]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg" />;
}
