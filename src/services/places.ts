// Google Places search helpers (Places library is loaded with the Maps JS API).
// Falls back gracefully when the map key is absent — callers merge these
// results with the offline Ahmedabad location list.

export interface PlacePrediction {
  placeId: string;
  primary: string;   // main name, e.g. "Manek Chowk"
  secondary: string; // supporting address line
}

interface GoogleLike {
  maps?: {
    places?: {
      AutocompleteService?: new () => {
        getPlacePredictions: (
          request: Record<string, unknown>,
          callback: (predictions: unknown[] | null, status: string) => void
        ) => void;
      };
    };
    Geocoder?: new () => {
      geocode: (
        request: Record<string, unknown>,
        callback: (results: unknown[] | null, status: string) => void
      ) => void;
    };
  };
}

const google = (): GoogleLike['maps'] | undefined =>
  (window as unknown as { google?: GoogleLike }).google?.maps;

const OK = 'OK';

/** Autocomplete predictions biased around the rider's area. */
export function searchPlaces(input: string, biasLat: number, biasLng: number): Promise<PlacePrediction[]> {
  const maps = google();
  const service = maps?.places?.AutocompleteService;
  if (!input.trim() || !service) return Promise.resolve([]);
  return new Promise((resolve) => {
    try {
      const autocomplete = new service();
      autocomplete.getPlacePredictions(
        {
          input,
          locationBias: { center: { lat: biasLat, lng: biasLng }, radius: 40000 },
          componentRestrictions: { country: 'in' },
        },
        (predictions, status) => {
          if (status !== OK || !predictions) { resolve([]); return; }
          resolve(predictions.map((raw) => {
            const p = raw as { place_id: string; structured_formatting?: { main_text?: string; secondary_text?: string }; description?: string };
            return {
              placeId: p.place_id,
              primary: p.structured_formatting?.main_text || p.description || 'Unknown place',
              secondary: p.structured_formatting?.secondary_text || '',
            };
          }).slice(0, 5));
        }
      );
    } catch {
      resolve([]);
    }
  });
}

export interface ResolvedPlace {
  lat: number;
  lng: number;
  name: string;
  address: string;
  area: string;
}

/** Resolve a selected prediction to coordinates + readable address. */
export function resolvePlace(placeId: string): Promise<ResolvedPlace | null> {
  const maps = google();
  const geocoder = maps?.Geocoder;
  if (!geocoder) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      new geocoder().geocode({ placeId }, (results, status) => {
        const first = results && status === OK ? (results[0] as {
          geometry?: { location?: { lat: () => number; lng: () => number } };
          formatted_address?: string;
          address_components?: Array<{ long_name: string; types: string[] }>;
        }) : undefined;
        const location = first?.geometry?.location;
        if (!first || !location) { resolve(null); return; }
        const city = first.address_components?.find((c) => c.types.includes('locality'))?.long_name
          || first.address_components?.find((c) => c.types.includes('administrative_area_level_2'))?.long_name || 'Map pin';
        resolve({ lat: location.lat(), lng: location.lng(), name: first.formatted_address || 'Selected place', address: first.formatted_address || '', area: city });
      });
    } catch {
      resolve(null);
    }
  });
}
