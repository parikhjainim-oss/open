import React from 'react';
import { Header } from '../common/Header';
import { store } from '../../services/store';
import { Ride } from '../../types';
import { Clock, MapPin, Receipt, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface RiderActivityProps {
  onBack: () => void;
  onSelectRideDetails: (ride: Ride) => void;
}

export const RiderActivity: React.FC<RiderActivityProps> = ({ onBack, onSelectRideDetails }) => {
  const rides = store.getState().rides;

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header title="Your Activity" onBack={onBack} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-8 px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Ride History</h2>
          <span className="text-xs text-gray-500">{rides.length} trips total</span>
        </div>

        {rides.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-gray-200">
            <Clock className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No trips yet</h3>
            <p className="text-xs text-gray-500">Your completed rides and receipts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div
                key={ride.id}
                onClick={() => onSelectRideDetails(ride)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF6B00] text-[22px]">
                      {ride.vehicleCategory === 'bike'
                        ? 'two_wheeler'
                        : ride.vehicleCategory === 'auto'
                        ? 'electric_rickshaw'
                        : 'local_taxi'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-gray-900">
                        {ride.vehicleCategory === 'bike'
                          ? 'M3 Bike Taxi'
                          : ride.vehicleCategory === 'auto'
                          ? 'M3 Auto'
                          : 'M3 Prime Cab'}
                      </span>
                      <p className="text-[10px] text-gray-400">{ride.createdAt}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-gray-900 font-['Inter']">
                      ₹{ride.fare.totalFare}
                    </span>
                    <span
                      className={`block text-[10px] font-bold ${
                        ride.status === 'COMPLETED'
                          ? 'text-green-600'
                          : ride.status === 'CANCELLED'
                          ? 'text-red-600'
                          : 'text-[#A04100]'
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="truncate font-medium">{ride.pickup.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-gray-800"></span>
                    <span className="truncate font-medium">{ride.drop.name}</span>
                  </div>
                </div>

                {ride.rating && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 bg-[#F7F8FA] p-2 rounded-lg">
                    <span className="font-semibold text-gray-800">Your Rating: ★ {ride.rating}</span>
                    <span className="text-gray-400 font-mono">{ride.id}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
