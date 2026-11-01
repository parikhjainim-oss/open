import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Map as MapIcon, KeyRound, LocateFixed } from 'lucide-react';
import { LocationPoint } from '../../types';

interface LiveMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  pickup?: LocationPoint;
  drop?: LocationPoint;
  onMapSelect?: (point: LocationPoint) => void;
  className?: string;
}

type LatLng = { lat: number; lng: number };
type MapInstance = {
  setCenter: (point: LatLng) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: string, handler: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => { remove: () => void };
};
type MarkerInstance = { map: MapInstance | null; position: LatLng; title?: string; content?: HTMLElement };
type MapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
  marker: { AdvancedMarkerElement: new (options: MarkerInstance) => { map: MapInstance | null } };
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=m3RideMapsReady&libraries=marker&v=weekly`;
    script.onerror = () => { window.clearTimeout(timeout); reject(new Error('Google Maps could not load. Check network access and API key restrictions.')); };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    mapsLoader = null;
    throw error;
  });
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
  onMapSelect,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const onMapSelectRef = useRef(onMapSelect);
  const clickListenerRef = useRef<{ remove: () => void } | null>(null);
  onMapSelectRef.current = onMapSelect;
  const mapRef = useRef<MapInstance | null>(null);
  const markerRefs = useRef<Array<{ map: MapInstance | null }>>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const key = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

  useEffect(() => {
    let active = true;
    if (!key || !mapId) {
      setStatus('error');
      setError(!key ? 'Add VITE_GOOGLE_MAPS_BROWSER_KEY to enable the live map.' : 'Add VITE_GOOGLE_MAPS_MAP_ID to enable advanced map markers.');
      return () => { active = false; };
    }
    setStatus('loading');
    loadGoogleMaps(key).then((maps) => {
      if (!active || !elementRef.current) return;
      const map = new maps.Map(elementRef.current, {
        center: { lat: pickup?.lat ?? lat, lng: pickup?.lng ?? lng },
        zoom,
        mapId,
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
      });
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
    return () => { active = false; clickListenerRef.current?.remove(); clickListenerRef.current = null; markerRefs.current.forEach((marker) => { marker.map = null; }); markerRefs.current = []; mapRef.current = null; };
  }, [key, mapId, lat, lng, zoom]);

  useEffect(() => {
    let active = true;
    const map = mapRef.current;
    if (!map || status !== 'ready' || !key || !mapId) return;
    if (pickup) map.setCenter({ lat: pickup.lat, lng: pickup.lng });
    loadGoogleMaps(key).then((maps) => {
      if (!active) return;
      markerRefs.current.forEach((marker) => { marker.map = null; });
      markerRefs.current = [];
      const addMarker = (point: LocationPoint | undefined, kind: 'pickup' | 'drop') => {
        if (!point) return;
        markerRefs.current.push(new maps.marker.AdvancedMarkerElement({ map, position: { lat: point.lat, lng: point.lng }, title: `${kind === 'pickup' ? 'Pickup' : 'Destination'}: ${point.name}`, content: markerContent(kind) }));
      };
      addMarker(pickup, 'pickup');
      addMarker(drop, 'drop');
    }).catch(() => undefined);
    return () => { active = false; };
  }, [pickup, drop, status, key, mapId]);

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
      {status === 'ready' && <button type="button" onClick={recenter} aria-label="Recenter map on my location" className="absolute bottom-4 right-4 z-10 rounded-xl bg-white p-3 text-gray-700 shadow-lg hover:text-[#FF6B00]"><LocateFixed size={19} /></button>}
      {error && status === 'ready' && <div role="status" className="absolute left-3 right-3 top-3 rounded-lg bg-white px-3 py-2 text-xs text-gray-700 shadow">{error}</div>}
    </div>
  );
};
