// Destination search backed by OpenStreetMap's free Nominatim service —
// no API key required. Results merge with the offline Ahmedabad location
// list in the rider home search panel.
//
// Usage policy: light, debounced use. https://operations.osmfoundation.org/policies/nominatim/

export interface PlacePrediction {
  placeId: string;
  primary: string;
  secondary: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

/** Autocomplete-style predictions biased around the rider's area. */
export async function searchPlaces(input: string, biasLat: number, biasLng: number): Promise<PlacePrediction[]> {
  const query = input.trim();
  if (query.length < 3) return [];
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=in'
      + `&q=${encodeURIComponent(query)}`
      + `&viewbox=${biasLng - 0.6},${biasLat + 0.6},${biasLng + 0.6},${biasLat - 0.6}&bounded=0`;
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) return [];
    const results = (await response.json()) as NominatimResult[];
    return results.map((r) => {
      const parts = r.display_name.split(', ');
      return {
        placeId: String(r.place_id),
        primary: r.name || parts[0] || r.display_name,
        secondary: parts.slice(1).join(', '),
      };
    });
  } catch {
    return [];
  }
}

export interface ResolvedPlace {
  lat: number;
  lng: number;
  name: string;
  address: string;
  area: string;
}

/** Coordinates + readable address for a search hit (lookup across OSM id types). */
export async function resolvePlace(placeId: string): Promise<ResolvedPlace | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/lookup?osm_ids=R${placeId},W${placeId},N${placeId}&format=jsonv2&addressdetails=1`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const results = (await response.json()) as NominatimResult[];
    const first = results[0];
    if (!first) return null;
    const parts = first.display_name.split(', ');
    const city = first.address?.city || first.address?.town || first.address?.state_district || parts[parts.length - 3] || 'Map pin';
    return { lat: Number(first.lat), lng: Number(first.lon), name: first.name || parts[0], address: first.display_name, area: city };
  } catch {
    return null;
  }
}
