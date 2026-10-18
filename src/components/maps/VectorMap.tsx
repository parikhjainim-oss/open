import React, { useState, useEffect } from 'react';
import { Crosshair, ShieldCheck, Zap } from 'lucide-react';

interface VectorMapProps {
  mode?: 'overview' | 'route' | 'surge';
  height?: string;
  captainLocation?: { lat: number; lng: number; name?: string };
  etaText?: string;
  trafficStatus?: string;
  onRecenter?: () => void;
  selectedCategory?: 'bike' | 'auto' | 'cab';
}

export const VectorMap: React.FC<VectorMapProps> = ({
  mode = 'overview',
  height = 'h-[360px]',
  etaText = '8.4 km • 22 mins via Relief Rd',
  trafficStatus = 'Moderate Traffic',
  onRecenter
}) => {
  // Animated vehicle positions along Ahmedabad roads
  const [bikeOffset, setBikeOffset] = useState({ x: 142, y: 178 });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
      setBikeOffset((prev) => ({
        x: 142 + Math.sin(Date.now() / 1500) * 8,
        y: 178 + Math.cos(Date.now() / 1500) * 6
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full ${height} bg-[#E7EEFE] overflow-hidden select-none`}>
      {/* SVG Vector Map Substrate - High Fidelity Ahmedabad Canvas */}
      <svg
        className="absolute inset-0 w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 400 360"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b4c5ff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#6f94ff" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="surgeVastrapur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFB693" stopOpacity="0.05" />
          </linearGradient>

          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#dce2f3"
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>

        {/* Grid Block Foundations */}
        <rect width="400" height="360" fill="url(#gridPattern)" />

        {/* Sabarmati Riverfront Promenade Path & Water Body */}
        <path
          d="M 285 -10 C 270 90, 240 180, 255 260 C 265 310, 280 350, 310 400"
          fill="none"
          stroke="url(#riverGrad)"
          strokeLinecap="round"
          strokeWidth="42"
        />
        <path
          d="M 285 -10 C 270 90, 240 180, 255 260 C 265 310, 280 350, 310 400"
          fill="none"
          stroke="#e7eefe"
          strokeDasharray="6,4"
          strokeOpacity="0.8"
          strokeWidth="3.5"
        />

        {/* Major Ahmedabad Arteries: SG Highway, Ashram Rd, 132ft Ring Rd */}
        <path d="M -20 110 L 420 90" stroke="#ffffff" strokeLinecap="round" strokeWidth="9" />
        <path d="M -20 110 L 420 90" stroke="#f0f3ff" strokeDasharray="8,6" strokeWidth="4" />
        <text
          fill="#8e7164"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="1"
          x="32"
          y="83"
          className="font-sans"
        >
          SG HIGHWAY ARTERY
        </text>

        <path d="M 120 -20 L 90 400" stroke="#ffffff" strokeLinecap="round" strokeWidth="8" />
        <path d="M 120 -20 L 90 400" stroke="#dce2f3" strokeWidth="2" />
        <text
          fill="#8e7164"
          fontSize="8"
          fontWeight="600"
          transform="rotate(-80 75 320)"
          x="75"
          y="320"
          className="font-sans"
        >
          ASHRAM ROAD
        </text>

        {/* Local Streets: Navrangpura & Commerce Six Roads Area */}
        <path d="M 50 200 L 360 200" stroke="#ffffff" strokeWidth="6" />
        <path d="M 180 60 L 195 380" stroke="#ffffff" strokeWidth="6" />
        <path d="M 40 270 C 130 260, 180 280, 240 260" stroke="#ffffff" strokeWidth="4" />

        {/* Landmark Nodes */}
        <circle cx="180" cy="200" r="14" fill="#ffdbcc" fillOpacity="0.6" />
        <circle cx="180" cy="200" r="4.5" fill="#a04100" />
        <text
          fill="#5a4136"
          fontSize="8.5"
          fontWeight="700"
          x="135"
          y="224"
          className="font-sans"
        >
          COMMERCE SIX RDS
        </text>

        {/* Riverfront Promenade Area */}
        <rect x="270" y="130" width="36" height="55" rx="6" fill="#dce2f3" fillOpacity="0.75" />
        <text
          fill="#0053db"
          fontSize="7"
          fontWeight="700"
          letterSpacing="0.5"
          x="272"
          y="160"
          className="font-sans"
        >
          RIVERFRONT
        </text>

        {/* Route visualization for booking/tracking mode */}
        {(mode === 'route' || mode === 'overview') && (
          <>
            {/* Active route trajectory path */}
            <path
              d="M 180 200 C 160 170, 140 140, 210 110 C 250 90, 270 70, 310 60"
              stroke="#FF6B00"
              strokeLinecap="round"
              strokeWidth="5"
              fill="none"
              strokeDasharray="4 3"
            />
            {/* Destination node (Kalupur) */}
            <circle cx="310" cy="60" r="7" fill="#171717" />
            <circle cx="310" cy="60" r="3" fill="#ffffff" />
            <text x="290" y="50" fontSize="8" fontWeight="800" fill="#171717">
              KALUPUR STN
            </text>
          </>
        )}

        {/* Surge heat map radial circles if mode is surge */}
        {mode === 'surge' && (
          <>
            <circle cx="80" cy="90" r="50" fill="url(#surgeVastrapur)" />
            <circle cx="180" cy="200" r="45" fill="url(#surgeVastrapur)" />
            <circle cx="280" cy="120" r="35" fill="url(#surgeVastrapur)" />
          </>
        )}
      </svg>

      {/* Floating Header HUD Chips */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {mode === 'overview' && (
          <>
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm pointer-events-auto border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
              <span className="w-2 h-2 -ml-3 rounded-full bg-[#A04100]"></span>
              <span className="text-xs font-bold text-gray-900">Ahmedabad Live</span>
              <span className="text-gray-400 text-[10px]">•</span>
              <span className="text-xs text-gray-600 font-medium">32°C Fair</span>
            </div>

            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm pointer-events-auto border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-[#0053DB]" />
              <span className="text-xs font-bold text-[#0053DB]">Suraksha Safe</span>
            </div>
          </>
        )}

        {mode === 'route' && (
          <div className="mx-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md pointer-events-auto border border-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-800">
              {etaText} • <strong className="text-[#A04100]">{trafficStatus}</strong>
            </span>
          </div>
        )}

        {mode === 'surge' && (
          <div className="flex items-center gap-2 bg-[#171717] text-white px-3 py-1.5 rounded-full shadow-md pointer-events-auto">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold">Ahmedabad Live Demand Surge</span>
          </div>
        )}
      </div>

      {/* Overview Markers (Active Fleet Units) */}
      {mode === 'overview' && (
        <>
          {/* Bike 1 (Karan Shah 2 mins away near Commerce Six Road) */}
          <div
            style={{ left: `${bikeOffset.x}px`, top: `${bikeOffset.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-1000 z-10"
          >
            <div className="px-1.5 py-0.5 rounded-full bg-white shadow-md flex items-center gap-0.5 mb-1 animate-bounce">
              <span className="text-[10px] font-extrabold text-[#A04100]">2m</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#FF6B00] border border-orange-100">
              <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
            </div>
          </div>

          {/* Bike 2 */}
          <div className="absolute top-[108px] left-[78px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-[#A04100]">
              <span className="material-symbols-outlined text-[15px]">two_wheeler</span>
            </div>
          </div>

          {/* Auto Rickshaw 1 (4 mins away) */}
          <div className="absolute top-[138px] left-[225px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10">
            <div className="px-1.5 py-0.5 rounded-full bg-white shadow-md flex items-center gap-0.5 mb-1">
              <span className="text-[10px] font-extrabold text-gray-900">4m</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-900 border border-gray-100">
              <span className="material-symbols-outlined text-[18px]">electric_rickshaw</span>
            </div>
          </div>

          {/* Cab 1 (6 mins away) */}
          <div className="absolute top-[85px] left-[260px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="px-1.5 py-0.5 rounded-full bg-white shadow-sm flex items-center gap-0.5 mb-1">
              <span className="text-[10px] font-extrabold text-[#0053DB]">6m</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-[#0053DB]">
              <span className="material-symbols-outlined text-[16px]">local_taxi</span>
            </div>
          </div>
        </>
      )}

      {/* User's Exact Pickup Location Pin with Radar Ripple */}
      <div className="absolute top-[200px] left-[180px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 animate-ping absolute"></div>
          <div className="w-9 h-9 rounded-full bg-[#FF6B00]/30 flex items-center justify-center relative">
            <div className="w-5 h-5 rounded-full bg-[#A04100] flex items-center justify-center shadow-lg shadow-orange-500/40">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Surge Heatmap Zone Labels if in surge mode */}
      {mode === 'surge' && (
        <>
          <div className="absolute top-12 left-4 z-10">
            <div className="px-2.5 py-1 rounded-full bg-gray-900/90 backdrop-blur text-white flex items-center gap-1.5 shadow-sm text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span>SG Highway • 1.8x Surge</span>
            </div>
          </div>
          <div className="absolute top-20 right-4 z-10">
            <div className="px-2.5 py-1 rounded-full bg-gray-900/90 backdrop-blur text-white flex items-center gap-1.5 shadow-sm text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span>Vastrapur • 1.5x</span>
            </div>
          </div>
          <div className="absolute bottom-12 left-4 z-10">
            <div className="px-2.5 py-1 rounded-full bg-gray-900/90 backdrop-blur text-white flex items-center gap-1.5 shadow-sm text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span>Navrangpura • High Demand</span>
            </div>
          </div>
        </>
      )}

      {/* Recenter Map Floating Action Icon Button */}
      <button
        type="button"
        onClick={onRecenter}
        aria-label="Recenter map to current location"
        className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-transform active:scale-95 z-20 border border-gray-100"
      >
        <Crosshair className="w-5 h-5 text-[#A04100]" />
      </button>
    </div>
  );
};
