import React from 'react';
import { ArrowLeft, Shield, MapPin, ChevronDown } from 'lucide-react';
import { SosModal } from './SosModal';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  userPhoto?: string;
  onProfileClick?: () => void;
  activeRideId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  userPhoto = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTXrcdJIoRdV5U9HQ5kIVBY1vwkRrptr-f1okmxcc_--v4DpK--7V8m2Lb9T6EOtkYZb2C8jHxGVzKtf33Bfo9Hz980Dr3Jn3cEE1sEP_fr1H716eDnZJcTDCfGleEzBJAx4hCQw7f3GwMeEVopsvtXWYq9yrPVJmwbRyTCenLWSFBUFxFjcPN7eXgfFkjTsViA_6rXX3N0rJCP0eTzahUN9tHPCK4835h_wR5pAYf6TOw2NQuc0fT',
  onProfileClick,
  activeRideId
}) => {
  const [showSos, setShowSos] = React.useState(false);
  const [showCityPicker, setShowCityPicker] = React.useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-100">
        {/* Device Status Bar */}
        <div className="h-6 px-4 flex items-center justify-between text-gray-500 text-xs font-semibold select-none">
          <span className="font-bold text-gray-900">9:41</span>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[15px]">battery_full</span>
          </div>
        </div>

        {/* Action Header */}
        <div className="h-14 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 text-gray-900 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
            ) : null}

            {/* Brand Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-7 w-7 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                M3
              </div>
              <span className="font-extrabold text-gray-900 tracking-tight text-base font-['Inter']">
                RIDE
              </span>
            </div>

            {title ? (
              <h1 className="text-base font-bold text-gray-900 truncate ml-1">{title}</h1>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCityPicker(!showCityPicker)}
                  className="flex items-center gap-1 h-9 px-2.5 rounded-full bg-[#E7EEFE] hover:bg-[#DCE2F3] transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#A04100]" />
                  <span className="text-xs font-bold text-gray-900">Ahmedabad</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {showCityPicker && (
                  <div className="absolute top-11 left-0 z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-xs">
                    <div className="px-3 py-1.5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                      Operational Zones
                    </div>
                    <div className="px-3 py-2 bg-orange-50 font-bold text-[#A04100] flex items-center justify-between">
                      <span>Ahmedabad (Live Zone)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                    <div className="px-3 py-2 text-gray-400">Gandhinagar (Expanding)</div>
                    <div className="px-3 py-2 text-gray-400">Vadodara (Coming Soon)</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header: SOS & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSos(true)}
              aria-label="Emergency Safety SOS"
              className="min-h-[40px] px-3 rounded-full bg-red-50 hover:bg-red-100 flex items-center gap-1.5 text-red-600 transition-all border border-red-200"
            >
              <Shield className="w-4 h-4 fill-red-600 text-red-600" />
              <span className="text-xs font-extrabold tracking-wider">SOS</span>
            </button>

            <button
              type="button"
              onClick={onProfileClick}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#FF6B00]/30 hover:ring-[#FF6B00] transition-all"
            >
              <img
                src={userPhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback avatar if load fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </button>
          </div>
        </div>
      </header>

      <SosModal
        isOpen={showSos}
        onClose={() => setShowSos(false)}
        activeRideId={activeRideId}
      />
    </>
  );
};
