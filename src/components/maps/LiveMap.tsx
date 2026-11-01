import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Map as MapIcon, KeyRound, LocateFixed } from 'lucide-react';
import { LocationPoint } from '../../types';
import { RouteResult, liveApi } from '../../services/api';

export interface NearbyCaptainPoint { lat: number; lng: number; label?: string; }

interface LiveMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  pickup?: LocationPoint;
  drop?: LocationPoint;
  nearbyCaptains?: NearbyCaptainPoint[];
  onMapSelect?: (point: LocationPoint) => void;
  onRouteInfo?: (info: { distanceKm: number; etaMins: number }) => void;
  className?: string;
}

type LatLng = { lat: number; lng: number };
type MapInstance = {
  setCenter: (point: LatLng) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, handler: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => { remove: () => void };
};
type AdvancedMarkerOptions = { map: MapInstance | null; position: LatLng; title?: string; content?: HTMLElement };
type MarkerCleanup = { remove: () => void };
type PolylineInstance = { setMap: (map: MapInstance | null) => void };
type CircleInstance = { setMap: (map: MapInstance | null) => void };
type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Marker: new (options: { map: MapInstance; position: LatLng; title?: string }) => { setMap: (map: MapInstance | null) => void };
  marker: { AdvancedMarkerElement: new (options: AdvancedMarkerOptions) => { map: MapInstance | null } };
  Polyline: new (options: { path: LatLng[]; strokeColor?: string; strokeOpacity?: number; strokeWeight?: number; map?: MapInstance; clickable?: boolean; geodesic?: boolean; icons?: unknown }) => PolylineInstance;
  Circle: new (options: { center: LatLng; radius: number; map?: MapInstance; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; clickable?: boolean }) => CircleInstance;
  SymbolPath?: Record<string, unknown>;
  encoding?: { decodePath: (encoded: string) => LatLng[] };
};
type MapsWindow = Window & { google?: { maps?: MapsApi }; m3RideMapsReady?: () => void };

let mapsLoader: Promise<MapsApi> | null = null;
function loadGoogleMaps(key: string): Promise<MapsApi> {
  if ((window as MapsWindow).google?.maps) return Promise.resolve((window as MapsWindow).google!.maps!);
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-m3-google-maps]');
    const timeout = window.setTimeout(() => reject(new Error('Google Maps took too long to load. Check the key, map ID, billing, and allowed website origins.')), 12000);
    const finish = () => {
      const maps = (window as MapsWindow).google?.maps;
      if (!maps) { window.clearTimeout(timeout); reject(new Error('Google Maps loaded without the Maps JavaScript API.')); return; }
      window.clearTimeout(timeout);
      resolve(maps);
    };
    if (existingScript) {
      (window as MapsWindow).m3RideMapsReady = finish;
      existingScript.addEventListener('load', finish, { once: true });
      return;
    }
    (window as MapsWindow).m3RideMapsReady = finish;
    const script = document.createElement('script');
    script.dataset.m3GoogleMaps = 'true';
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=m3RideMapsReady&libraries=marker,places&v=weekly`;
    script.onerror = () => { window.clearTimeout(timeout); reject(new Error('Google Maps could not load. Check network access and API key restrictions.')); };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    mapsLoader = null;
    throw error;
  }) as Promise<MapsApi>;
  return mapsLoader;
}

function haversineKm(a: LatLng, b: LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const markerContent = (kind: 'pickup' | 'drop') => {
  const element = document.createElement('div');
  element.style.cssText = `width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${kind === 'pickup' ? '#FF6B00' : '#171717'};border:3px solid #fff;box-shadow:0 2px 8px #0004;`;
  const dot = document.createElement('span');
  dot.style.cssText = 'display:block;width:6px;height:6px;background:#fff;border-radius:50%;margin:9px auto;';
  element.appendChild(dot);
  return element;
};

import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass } from 'lucide-react';
import { mapTileConfig } from '../../config/mapTiles';

interface OsmFallbackMapProps {
  pickup?: LocationPoint;
  drop?: LocationPoint;
  captains?: NearbyCaptainPoint[];
  onPickLocation?: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
}

/**
 * Interactive rider map (Leaflet + OpenStreetMap tiles â€” no API key, no
 * billing). Pans to GPS, supports pickup/destination markers, captain dots,
 * route polyline, tap-to-set pickup, and shows the required OpenStreetMap
 * attribution. Tile provider is configured once in src/config/mapTiles.ts.
 */
export const OsmFallbackMap: React.FC<OsmFallbackMapProps> = ({
  pickup, drop, captains, onPickLocation, height = 360, zoom = 13,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<leaflet.Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [captainDots, setCaptainDots] = useState<{ lat: number; lng: number; label?: string }[]>([]);

  useEffect(() => { setCaptainDots(captains || []); }, [captains]);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    const center: LatLng = pickup ? { lat: pickup.lat, lng: pickup.lng } : drop ? { lat: drop.lat, lng: drop.lng } : { lat: 23.0225, lng: 72.5714 };
    const map = leaflet.map(elementRef.current, { center: [center.lat, center.lng], zoom, zoomControl: true, attributionControl: true });
    leaflet.tileLayer(mapTileConfig.url, {
      maxZoom: mapTileConfig.maxZoom,
      attribution: mapTileConfig.attribution,
    }).addTo(map);
    mapRef.current = map;
    setStatus('ready');
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to GPS pickup when it changes.
  useEffect(() => {
    if (pickup && mapRef.current) mapRef.current.setView([pickup.lat, pickup.lng], zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup?.lat, pickup?.lng]);

  // Render markers + route polyline.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !status) return;
    map.eachLayer((layer) => {
      if (layer instanceof leaflet.Marker || layer instanceof leaflet.Polyline) map.removeLayer(layer);
    });
    if (pickup) {
      leaflet.marker([pickup.lat, pickup.lng], { title: 'Pickup' }).addTo(map)
        .bindPopup(`<strong>Pickup</strong><br/>${pickup.name ?? ''}`);
    }
    if (drop) {
      leaflet.marker([drop.lat, drop.lng], { title: 'Destination' }).addTo(map)
        .bindPopup(`<strong>Destination</strong><br/>${drop.name ?? ''}`).openPopup();
    }
    if (pickup && drop) {
      leaflet.polyline([[pickup.lat, pickup.lng], [drop.lat, drop.lng]], { color: '#FF6B00', weight: 5, opacity: 0.9 }).addTo(map);
    }
    captainDots.forEach((dot) => {
      leaflet.circleMarker([dot.lat, dot.lng], {
        radius: 7, color: '#0053DB', fillColor: '#0053DB', fillOpacity: 0.9, weight: 2,
      }).addTo(map).bindPopup(dot.label ?? 'Captain nearby');
    });
  }, [pickup, drop, captainDots, status]);

  // Tap-to-pick destination.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onPickLocation) return;
    const handler = (event: leaflet.LeafletMouseEvent) => {
      onPickLocation(event.latlng.lat, event.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [onPickLocation, status]);

  // GPS recentre button.
  const recenter = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.setView([position.coords.latitude, position.coords.longitude], zoom);
    }, () => { /* GPS denied */ }, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={elementRef} className="w-full" style={{ height }} />
      {status === 'loading' && <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">Loading mapâ€¦</p>}
      <button type="button" onClick={recenter} aria-label="Recenter on GPS" className="absolute bottom-3 right-3 z-10 rounded-full bg-white p-2.5 text-gray-700 shadow-lg hover:text-[#FF6B00]">
        <Compass className="h-5 w-5" />
      </button>
      {!import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY ? null : null}
    </div>
  );
}

