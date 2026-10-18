import React from 'react';
import { store } from '../../services/store';
import { UserRole } from '../../types';
import { RefreshCw, SplitSquareVertical, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface DevRoleSwitcherProps {
  currentRole: UserRole | 'split';
  onChangeRole: (role: UserRole | 'split') => void;
  activeRideId?: string | null;
}

export const DevRoleSwitcher: React.FC<DevRoleSwitcherProps> = ({
  currentRole,
  onChangeRole,
  activeRideId
}) => {
  const activeRide = store.getState().rides.find((r) => r.id === activeRideId);

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-[#171717] text-white border-b border-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 h-10 flex items-center justify-between text-xs">
        {/* Left: Dev Mode badge */}
        <div className="flex items-center gap-2">
          <span className="bg-[#FF6B00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            DEV MODE
          </span>
          <span className="hidden sm:inline text-gray-400 font-medium">
            M3 RIDE Multi-Role Sandbox
          </span>
        </div>

        {/* Center: Role Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800">
          <button
            type="button"
            onClick={() => onChangeRole('rider')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              currentRole === 'rider'
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Rider App
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('captain')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              currentRole === 'captain'
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Captain App
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('admin')}
            className={`px-2.5 py-1 rounded font-bold transition-colors ${
              currentRole === 'admin'
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Dashboard
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('split')}
            className={`px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
              currentRole === 'split'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Split Side-by-Side Live Dispatch"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split View</span>
          </button>
        </div>

        {/* Right: Active Ride status chip & Reset */}
        <div className="flex items-center gap-2">
          {activeRide && (
            <div className="hidden lg:flex items-center gap-1.5 bg-orange-950/80 text-orange-300 px-2 py-0.5 rounded text-[10px] font-mono border border-orange-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span>
                {activeRide.id}: {activeRide.status}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => store.resetToSeed()}
            title="Reset to fresh Ahmedabad seed data"
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
