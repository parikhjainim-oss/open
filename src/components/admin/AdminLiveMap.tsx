import React, { useState } from 'react';
import { store } from '../../services/store';
import { VectorMap } from '../maps/VectorMap';
import { VehicleCategory, RideStatus } from '../../types';
import { MapPin, Filter, Car, Zap, RefreshCw, Eye } from 'lucide-react';

interface AdminLiveMapProps {
  embedded?: boolean;
  height?: string;
}

export const AdminLiveMap: React.FC<AdminLiveMapProps> = ({
  embedded = false,
  height = 'h-[500px]'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | VehicleCategory>('all');
  const [selectedZone, setSelectedZone] = useState('All Ahmedabad');
  const captains = store.getState().captains;
  const rides = store.getState().rides.filter((r) =>
    ['REQUESTED', 'SEARCHING', 'ASSIGNED', 'CAPTAIN_ARRIVING', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)
  );

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Category:</span>
            <div className="flex items-center gap-1">
              {(['all', 'bike', 'auto', 'cab'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#FF6B00] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Service Area:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
            >
              <option>All Ahmedabad</option>
              <option>Navrangpura & Commerce Six Rd</option>
              <option>SG Highway Corridor</option>
              <option>Vastrapur / Satellite</option>
              <option>Kalupur Railway District</option>
            </select>
          </div>
        </div>
      )}

      {/* Map Substrate */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <VectorMap mode="overview" height={height} />
      </div>

      {/* Active Units Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Active In-Flight Trips</span>
            <p className="text-base font-bold text-gray-900">{rides.length} trips en route</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Captains Live Telemetry</span>
            <p className="text-base font-bold text-gray-900">{captains.filter((c) => c.isOnline).length} units on duty</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#0053DB]"></span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-gray-400 font-bold uppercase text-[10px]">Highest Surge Corridor</span>
            <p className="text-base font-bold text-[#A04100]">SG Highway (1.8x)</p>
          </div>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
      </div>
    </div>
  );
};
