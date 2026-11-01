import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Map as MapIcon, KeyRound, LocateFixed } from 'lucide-react';
import { LocationPoint } from '../../types';

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
  Polyline: new (options: { path: LatLng[]; strokeColor?: string; strokeOpacity?: number; strokeWeight?: number; map?: MapInstance; clickable?: boolean; geodesic?: boolean }) => PolylineInstance;
  Circle: new (options: { center: LatLng; radius: number; map?: MapInstance; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; clickable?: boolean }) => CircleInstance;
  SymbolPath?: unknown;
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

const markerContent = (kind: 'pickup' | 'drop') => {
  const element = document.createElement('div');
  element.style.cssText = `width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${kind === 'pickup' ? '#FF6B00' : '#171717'};border:3px solid #fff;box-shadow:0 2px 8px #0004;`;
  const dot = document.createElement('span');
  dot.style.cssText = 'display:block;width:6px;height:6px;background:#fff;border-radius:50%;margin:9px auto;';
  element.appendChild(dot);
  return element;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  lat = 23.0225,
  lng = 72.5714,
  zoom = 13,
  height = '400px',
  pickup,
  drop,
  nearbyCaptains,
  onMapSelect,
  onRouteInfo,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const onMapSelectRef = useRef(onMapSelect);
  const clickListenerRef = useRef<{ remove: () => void } | null>(null);
type NearbyCaptainPoint = { lat: number; lng: number; label?: string };
  const nearbyCaptainsRef = useRef(nearbyCaptains);
  const onRouteInfoRef = useRef(onRouteInfo);
  onMapSelectRef.current = onMapSelect;
  onRouteInfoRef.current = onRouteInfo;
  nearbyCaptainsRef.current = nearbyCaptains;
  const mapRef = useRef<MapInstance | null>(null);
  const markerRefs = useRef<MarkerCleanup[]>([]);
  const polylineRef = useRef<PolylineInstance | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; etaMins: number } | null>(null);
  const [error, setError] = useState('');
  const [markerError, setMarkerError] = useState('');
  const key = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

  useEffect(() => {
    let active = true;
    if (!key) {
      setStatus('error');
      setError('Add VITE_GOOGLE_MAPS_BROWSER_KEY to enable the live map.');
      return () => { active = false; };
    }
    setStatus('loading');
    loadGoogleMaps(key).then((maps) => {
      if (!active || !elementRef.current) return;
      const mapOptions: Record<string, unknown> = {
        center: { lat: pickup?.lat ?? lat, lng: pickup?.lng ?? lng },
        zoom,
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
      };
      if (mapId) mapOptions.mapId = mapId;
      const map = new maps.Map(elementRef.current, mapOptions);
      mapRef.current = map;
      const clickListener = map.addListener('click', (event) => {
        const point = event.latLng;
        if (point) onMapSelectRef.current?.({ lat: point.lat(), lng: point.lng(), name: 'Selected map location', address: `${point.lat().toFixed(5)}, ${point.lng().toFixed(5)}`, area: 'Map pin' });
      });
      clickListenerRef.current = clickListener;
      setStatus('ready');
    }).catch((cause: unknown) => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : 'Google Maps is unavailable.');
      setStatus('error');
    });
    return () => { active = false; clickListenerRef.current?.remove(); clickListenerRef.current = null; markerRefs.current.forEach((marker) => marker.remove()); markerRefs.current = []; polylineRef.current = null; mapRef.current = null; };
  }, [key, mapId, lat, lng, zoom]);

  // Route line between pickup and drop (haversine distance + traffic-paced ETA).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready' || !key || !pickup || !drop) { if (!pickup || !drop) { polylineRef.current?.setMap(null); polylineRef.current = null; setRouteInfo(null); onRouteInfoRef.current = null as never; } return; }
    const haversine = (a: LatLng, b: LatLng) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371; const dLat = toRad(b.lat - a.lat); const dLng = toRad(b.lng - a.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const straightKm = haversine({ lat: pickup.lat, lng: pickup.lng }, { lat: drop.lat, lng: drop.lng });
    const roadKm = Math.round(straightKm * 1.35 * 10) / 10; // road-factor correction
    const etaMins = Math.max(4, Math.round((roadKm / 24) * 60 + 2)); // ~24 km/h urban average + slack
    const maps = (window as MapsWindow).google?.maps;
    if (!maps) return;
    polylineRef.current?.setMap(null);
    const solid = new maps.Polyline({
      path: [ { lat: pickup.lat, lng: pickup.lng }, { lat: drop.lat, lng: drop.lng } ],
      strokeColor: '#FF6B00', strokeOpacity: 0.85, strokeWeight: 4, geodesic: true, clickable: false,
      map,
    });
    polylineRef.current = { setMap: (m) => { solid.setMap(m); } };
    setRouteInfo({ distanceKm: roadKm, etaMins });
    onRouteInfoRef.current?.({ distanceKm: roadKm, etaMins });
  }, [pickup, drop, status, key]);

  useEffect(() => {
    let active = true;
    const map = mapRef.current;
    if (!map || status !== 'ready' || !key) return;
    if (pickup) map.setCenter({ lat: pickup.lat, lng: pickup.lng });
    loadGoogleMaps(key).then((maps) => {
      if (!active) return;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      const addMarker = (point: LocationPoint | undefined, kind: 'pickup' | 'drop') => {
        if (!point) return;
        const title = `${kind === 'pickup' ? 'Pickup' : 'Destination'}: ${point.name}`;
        if (mapId) {
          const marker = new maps.marker.AdvancedMarkerElement({ map, position: { lat: point.lat, lng: point.lng }, title, content: markerContent(kind) });
          markerRefs.current.push({ remove: () => { marker.map = null; } });
        } else {
          const marker = new maps.Marker({ map, position: { lat: point.lat, lng: point.lng }, title });
          markerRefs.current.push({ remove: () => marker.setMap(null) });
        }
      };
      addMarker(pickup, 'pickup');
      addMarker(drop, 'drop');
      // Nearby captains as pulsing dots
      (nearbyCaptainsRef.current || []).forEach((c) => {
        if (mapId) {
          const el = document.createElement('div');
          el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#0053DB;border:2.5px solid #fff;box-shadow:0 0 0 4px rgba(0,83,219,.18);';
          el.title = c.label || 'Captain nearby';
          const marker = new maps.marker.AdvancedMarkerElement({ map, position: { lat: c.lat, lng: c.lng }, title: c.label || 'Captain nearby', content: el });
          markerRefs.current.push({ remove: () => { marker.map = null; } });
        } else {
          const marker = new maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, title: c.label || 'Captain nearby' });
          markerRefs.current.push({ remove: () => marker.setMap(null) });
        }
      });
      setMarkerError('');
    }).catch((cause: unknown) => {
      if (!active) return;
      setMarkerError(cause instanceof Error && cause.message ? cause.message : 'Unable to load map markers.');
    });
    return () => { active = false; };
  }, [pickup, drop, status, key, mapId, nearbyCaptains]);

  const recenter = () => {
    if (!navigator.geolocation) { setError('Location is not available in this browser.'); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      mapRef.current?.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      mapRef.current?.setZoom(16);
    }, () => setError('Location permission was denied. You can still tap the map to set a pickup.'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#edf1f5] ${className}`} style={{ height }} aria-label="Map">
      <div ref={elementRef} className="absolute inset-0" />
      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f4f7fa] to-[#e5eaf0] p-6 text-center">
          <div className="max-w-xs rounded-2xl border border-white bg-white/95 p-5 shadow-lg">
            {status === 'loading' ? <MapIcon className="mx-auto mb-3 h-7 w-7 text-[#FF6B00]" /> : key ? <MapPin className="mx-auto mb-3 h-7 w-7 text-amber-600" /> : <KeyRound className="mx-auto mb-3 h-7 w-7 text-amber-600" />}
            <p className="text-sm font-bold text-gray-900">{status === 'loading' ? 'Loading Google Maps…' : key ? 'Live map unavailable' : 'Google Maps setup required'}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">{error || 'Connect to the map service and try again.'}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Ahmedabad • M3 Ride map</p>
          </div>
        </div>
      )}
      {status === 'ready' && routeInfo && pickup && drop && (
        <div className="absolute left-3 top-3 z-10 rounded-xl bg-white/95 px-3 py-2 shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Route</p>
          <p className="text-xs font-extrabold tabular-nums text-gray-900">{routeInfo.distanceKm} km · ~{routeInfo.etaMins} min</p>
        </div>
      )}
      {status === 'ready' && <button type="button" onClick={recenter} aria-label="Recenter map on my location" className="absolute bottom-4 right-4 z-10 rounded-xl bg-white p-3 text-gray-700 shadow-lg hover:text-[#FF6B00]"><LocateFixed size={19} /></button>}
      {(markerError || error) && status === 'ready' && <div role="status" className="absolute left-3 right-3 top-3 rounded-lg bg-white px-3 py-2 text-xs text-gray-700 shadow">{markerError || error}</div>}
    </div>
  );
};
