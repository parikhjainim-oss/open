import React, { useState } from 'react';
import { store } from '../../services/store';
import { CaptainProfile } from '../../types';
import { Users, Shield, Phone, AlertTriangle, CheckCircle2, UserX, UserCheck } from 'lucide-react';

export const AdminCaptains: React.FC = () => {
  const captains = store.getState().captains;
  const [selectedCaptain, setSelectedCaptain] = useState<CaptainProfile | null>(null);

  const handleToggleSuspension = (captainId: string) => {
    store.toggleCaptainSuspension(captainId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Captains & Vehicle Fleet</h2>
          <p className="text-xs text-gray-500">Fleet management and active duty monitor</p>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          {captains.filter((c) => c.isOnline).length} Active Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {captains.map((captain) => (
          <div
            key={captain.id}
            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3 hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={captain.photo}
                  alt={captain.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{captain.name}</span>
                    <span className="text-[10px] bg-[#FFDBCC] text-[#7A3000] font-extrabold px-1.5 py-0.2 rounded">
                      ★ {captain.rating}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{captain.phone}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        captain.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : captain.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {captain.status}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        captain.isOnline ? 'bg-blue-100 text-[#0053DB]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {captain.isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* License Plate Tag */}
              <div className="bg-[#FFEB3B] text-black px-2 py-0.5 rounded shadow-sm text-center font-bold font-mono text-xs border border-amber-300">
                {captain.vehicleNumber}
              </div>
            </div>

            {/* Vehicle & Earnings Row */}
            <div className="grid grid-cols-3 gap-2 bg-[#F7F8FA] p-2.5 rounded-xl text-xs text-center border">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle</span>
                <span className="font-semibold text-gray-900 truncate block">{captain.vehicleModel}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Today Fares</span>
                <span className="font-bold text-gray-900 font-['Inter']">₹{captain.todayEarnings}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Pass Status</span>
                <span className="font-semibold text-gray-900 truncate block">
                  {captain.subscription.status === 'active' ? 'Active Pass' : 'No Pass'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-500">
                {captain.totalTrips} Total Trips • Location: {captain.currentLocation.area}
              </span>

              <button
                type="button"
                onClick={() => handleToggleSuspension(captain.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  captain.status === 'suspended'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                {captain.status === 'suspended' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
