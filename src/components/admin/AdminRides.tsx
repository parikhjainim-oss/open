import React, { useState } from 'react';
import { store } from '../../services/store';
import { Ride, RideStatus, VehicleCategory } from '../../types';
import { Search, Eye, Filter, CheckCircle2, Clock, XCircle, ArrowRight, Shield } from 'lucide-react';

interface AdminRidesProps {
  limit?: number;
}

export const AdminRides: React.FC<AdminRidesProps> = ({ limit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RideStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | VehicleCategory>('ALL');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const allRides = store.getState().rides;

  const filtered = allRides.filter((ride) => {
    const matchesSearch =
      ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ride.captainName && ride.captainName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ride.pickup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.drop.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ride.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || ride.vehicleCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F7F8FA] px-3 py-2 rounded-xl border border-gray-200 w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Ride ID, Rider, Captain, Area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-gray-900"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CAPTAIN_ARRIVING">Captain Arriving</option>
              <option value="SEARCHING">Searching</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white uppercase"
            >
              <option value="ALL">All Categories</option>
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              <option value="cab">Cab</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Component */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Trip ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Captain & Vehicle</th>
                <th className="px-4 py-3">Route (Pickup → Drop)</th>
                <th className="px-4 py-3">Fare (INR)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No rides matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                displayList.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{ride.id}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F3FF] text-[#0053DB] border border-blue-100">
                        {ride.vehicleCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{ride.riderName}</td>
                    <td className="px-4 py-3">
                      {ride.captainName ? (
                        <div>
                          <span className="font-bold text-gray-900 block">{ride.captainName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {ride.vehicleNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      <span className="text-gray-900">{ride.pickup.name}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="text-gray-900">{ride.drop.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 font-['Inter']">
                      ₹{ride.fare.totalFare}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ride.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : ride.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-[#A04100]'
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRide(ride)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ride Detail & Event Timeline Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Trip Audit: {selectedRide.id}
                </h3>
                <p className="text-xs text-gray-500">Authorized State Audit & Event Timeline</p>
              </div>
              <button
                onClick={() => setSelectedRide(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Rider & Captain Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F8FA] p-3 rounded-xl border">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Rider</span>
                <p className="font-bold text-gray-900">{selectedRide.riderName}</p>
                <p className="text-[11px] text-gray-500 font-mono">{selectedRide.riderPhone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Captain</span>
                <p className="font-bold text-gray-900">{selectedRide.captainName || 'Not Assigned'}</p>
                <p className="text-[11px] text-gray-500 font-mono">{selectedRide.vehicleNumber || '-'}</p>
              </div>
            </div>

            {/* Fare Breakdown Details */}
            <div className="bg-[#F0F3FF] p-3 rounded-xl text-xs space-y-1.5 border border-blue-100">
              <span className="font-bold text-gray-900">Authoritative Fare Breakdown</span>
              <div className="flex justify-between text-gray-600">
                <span>Base Fare</span>
                <span>₹{selectedRide.fare.baseFare}.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distance ({selectedRide.distanceKm} km @ ₹{selectedRide.fare.perKmRate}/km)</span>
                <span>₹{selectedRide.fare.distanceFare}.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Levy</span>
                <span>₹{selectedRide.fare.platformLevy}.00</span>
              </div>
              {selectedRide.fare.discount > 0 && (
                <div className="flex justify-between text-[#A04100] font-semibold">
                  <span>Discount ({selectedRide.fare.promoCode})</span>
                  <span>-₹{selectedRide.fare.discount}.00</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-1">
                <span>Total Settled (Upfront Lock)</span>
                <span>₹{selectedRide.fare.totalFare}.00</span>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase">Event History</span>
              <div className="space-y-2 border-l-2 border-orange-200 pl-3 text-xs">
                {selectedRide.events.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{evt.status}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{evt.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600">{evt.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedRide(null)}
              className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl"
            >
              Close Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
