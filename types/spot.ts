export type SpotType = "restaurant" | "bar" | "coffee" | "hike" | "other";

export interface Spot {
  id: string;
  place_name: string;
  type: SpotType;
  neighborhood: string;
  food_recs: string | null;
  personal_note: string | null;
  reel_url: string;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  visited: boolean;
  created_at: string;
}

export interface ParsedSpot {
  place_name: string;
  type: SpotType;
  neighborhood: string;
  food_recs: string | null;
}
