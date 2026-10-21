// src/components/maps/LiveMap.tsx
import React from 'react';
/**
 * Simple live‑map component.
 * It receives `lat` and `lng` (default to a city centre) and renders an
 * embedded Google Maps view. If a `MAP_API_KEY` is defined in the environment
 * the map will use the Google Maps JavaScript API; otherwise it falls back to a
 * plain iframe embed (no API key required, but limited interactivity).
 */
interface LiveMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  lat = 23.0225, // default Ahmedabad centre
  lng = 72.5714,
  zoom = 13,
  height = '400px',
}) => {
  const apiKey = import.meta.env.VITE_MAP_API_KEY as string | undefined;
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`
    : `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div className="w-full" style={{ height }}>
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={src}
        allowFullScreen
      ></iframe>
    </div>
  );
};
