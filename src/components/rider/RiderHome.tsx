import React, { useState } from 'react';
import { Header } from '../common/Header';
import { VectorMap } from '../maps/VectorMap';
import { store, AHMEDABAD_LOCATIONS } from '../../services/store';
import { LocationPoint, VehicleCategory } from '../../types';
import { Search, Mic, MapPin, Shield, PhoneCall, Zap, Compass, Car, Clock, Wallet, User } from 'lucide-react';

interface RiderHomeProps {
  onSelectRideFlow: (category: VehicleCategory, pickup: LocationPoint, drop: LocationPoint) => void;
  onOpenActivity: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  activeTab: 'home' | 'activity' | 'wallet' | 'profile';
  displayName?: string;
}

export const RiderHome: React.FC<RiderHomeProps> = ({
  onSelectRideFlow,
  onOpenActivity,
  onOpenWallet,
  onOpenProfile,
  activeTab,
  displayName
}) => {
  const [selectedPickup, setSelectedPickup] = useState<LocationPoint>(AHMEDABAD_LOCATIONS[0]);
  const [selectedDrop, setSelectedDrop] = useState<LocationPoint>(AHMEDABAD_LOCATIONS[1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('bike');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalTarget, setLocationModalTarget] = useState<'pickup' | 'drop'>('drop');

  const handleQuickDestination = (loc: LocationPoint) => {
    setSelectedDrop(loc);
    onSelectRideFlow(selectedCategory, selectedPickup, loc);
  };

  const handleStartBooking = () => {
    onSelectRideFlow(selectedCategory, selectedPickup, selectedDrop);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] pb-20">
      {/* Top Header */}
      <Header
        onProfileClick={onOpenProfile}
        userPhoto={store.getState().rider.avatar}
      />

      <main className="flex flex-col w-full pt-20">
        {/* Interactive Map Substrate */}
        <VectorMap
          mode="overview"
          height="h-[380px]"
          onRecenter={() => setSelectedPickup(AHMEDABAD_LOCATIONS[0])}
        />

        {/* Foreground Bottom Sheet with Elevation */}
        <div className="flex flex-col -mt-5 bg-white rounded-t-3xl pt-3 px-4 pb-6 relative z-20 shadow-[0_-8px_24px_rgba(21,28,39,0.08)]">
          {/* Drag Handle Indicator */}
          <div className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3"></div>

          {/* Warm Local Greeting & City Traffic Status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                Namaste, {displayName?.split(' ')[0] || 'Rider'} <span className="inline-block animate-wiggle">👋</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">Ready to breeze past Ahmedabad traffic today?</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[11px] bg-[#FFDBCC] text-[#7A3000] px-2 py-0.5 rounded-full font-extrabold tracking-wide">
                Fast Fleet
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 font-medium">6 vehicles nearby</span>
            </div>
          </div>

          {/* Current Pickup Address Bar */}
          <div className="flex items-center gap-2.5 bg-[#F0F3FF] px-3.5 py-2.5 rounded-xl mb-3 border border-blue-50">
            <span className="material-symbols-outlined text-[#A04100] text-[20px] shrink-0">
              trip_origin
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Current Pickup
              </span>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {selectedPickup.name}, {selectedPickup.area}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocationModalTarget('pickup');
                setShowLocationModal(true);
              }}
              className="text-[#A04100] text-xs font-bold shrink-0 px-2.5 py-1 hover:bg-[#E7EEFE] rounded-lg transition-colors"
            >
              Change
            </button>
          </div>

          {/* Tactical 'Where to?' Search Interactive Hub */}
          <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-1 mb-3.5 hover:border-gray-400 focus-within:border-[#FF6B00] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#FFDBCC] flex items-center justify-center shrink-0 text-[#A04100]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              aria-label="Destination Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const match = AHMEDABAD_LOCATIONS.find((l) =>
                    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    l.area.toLowerCase().includes(searchQuery.toLowerCase())
                  ) || selectedDrop;
                  handleQuickDestination(match);
                }
              }}
              placeholder="Where to? Search destination in Ahmedabad..."
              className="w-full bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium truncate"
            />
            <button
              type="button"
              onClick={() => {
                setLocationModalTarget('drop');
                setShowLocationModal(true);
              }}
              aria-label="Location List"
              className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-[#A04100] shrink-0 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Quick One-Tap Destination Pills (Horizontal Scrollable Carousel) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
            {store.getState().rider.savedPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleQuickDestination(place.location)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0F3FF] hover:bg-[#E7EEFE] transition-colors shrink-0 text-left border border-blue-100/50"
              >
                <span className="text-base">{place.icon}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 leading-none">{place.title}</span>
                  <span className="text-[11px] text-gray-500 leading-tight mt-0.5">{place.subtitle}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Service Category Tier List (Interactive Options Preview) */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-bold text-gray-900">Available Rides</span>
              <span className="text-xs text-[#A04100] font-bold">Fastest Pickup: 2 mins</span>
            </div>

            {/* M3 Bike Taxi Card */}
            <div
              onClick={() => setSelectedCategory('bike')}
              className={`relative flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer border ${
                selectedCategory === 'bike'
                  ? 'bg-orange-50/70 border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/30'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFDBCC] flex items-center justify-center shrink-0 text-[#A04100]">
                  <span className="material-symbols-outlined text-[28px]">two_wheeler</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">M3 Bike Taxi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B00] text-white font-extrabold tracking-wide">
                      POPULAR
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Beat the jams • 2 mins away</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-extrabold text-gray-900 font-['Inter']">₹25</span>
                <span className="text-[11px] text-gray-400 line-through">₹35</span>
              </div>
            </div>

            {/* Auto Rickshaw Card */}
            <div
              onClick={() => setSelectedCategory('auto')}
              className={`relative flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer border ${
                selectedCategory === 'auto'
                  ? 'bg-orange-50/70 border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/30'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E7EEFE] flex items-center justify-center shrink-0 text-gray-800">
                  <span className="material-symbols-outlined text-[28px]">electric_rickshaw</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Auto Rickshaw</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold">
                      Up to 3
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Affordable city runs • 4 mins away</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-extrabold text-gray-900 font-['Inter']">₹40</span>
                <span className="text-[10px] text-gray-400">Meter direct</span>
              </div>
            </div>

            {/* AC Cab Card */}
            <div
              onClick={() => setSelectedCategory('cab')}
              className={`relative flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer border ${
                selectedCategory === 'cab'
                  ? 'bg-orange-50/70 border-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/30'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#DBE1FF] flex items-center justify-center shrink-0 text-[#0053DB]">
                  <span className="material-symbols-outlined text-[28px]">local_taxi</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Prime Cab AC</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0053DB]/15 text-[#0053DB] font-bold">
                      Top Rated
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Air-conditioned comfort • 6 mins away</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-extrabold text-gray-900 font-['Inter']">₹90</span>
                <span className="text-[10px] text-gray-400">Sedan & Hatch</span>
              </div>
            </div>
          </div>

          {/* Safety & Citizen Support Action Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F0F3FF] mb-4 border border-blue-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#A04100] shadow-sm">
                <Shield className="w-5 h-5 text-[#A04100]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">M3 Safety Shield Active</span>
                <span className="text-[11px] text-gray-500">GPS ride-monitoring & Gujarat Helpline</span>
              </div>
            </div>
            <a
              href="tel:18004197842"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#0053DB]" />
              <span>24x7 Help</span>
            </a>
          </div>

          {/* Primary Quick Ride Request Action Button */}
          <button
            type="button"
            onClick={handleStartBooking}
            className="w-full h-[52px] rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-base font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Zap className="w-5 h-5 fill-white text-white" />
            <span>Request Immediate Pickup</span>
          </button>
        </div>
      </main>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                Select {locationModalTarget === 'pickup' ? 'Pickup Location' : 'Destination'}
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2">
              {AHMEDABAD_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (locationModalTarget === 'pickup') {
                      setSelectedPickup(loc);
                    } else {
                      setSelectedDrop(loc);
                    }
                    setShowLocationModal(false);
                  }}
                  className="w-full p-3 rounded-xl hover:bg-orange-50 text-left border border-gray-100 flex items-start gap-3 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.address}</p>
                    {loc.landmark && (
                      <span className="text-[10px] text-orange-600 font-semibold">{loc.landmark}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 w-16 transition-colors text-[#A04100] font-bold"
          >
            <Car className="w-6 h-6 text-[#A04100]" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            type="button"
            onClick={onOpenActivity}
            className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Clock className="w-6 h-6 text-gray-500" />
            <span className="text-[10px]">Activity</span>
          </button>

          <button
            type="button"
            onClick={onOpenWallet}
            className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500 hover:text-gray-900 transition-colors relative"
          >
            <Wallet className="w-6 h-6 text-gray-500" />
            <span className="text-[10px]">Wallet</span>
            <span className="absolute top-1 right-4 w-2 h-2 rounded-full bg-[#FF6B00]"></span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex flex-col items-center justify-center gap-1 w-16 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <User className="w-6 h-6 text-gray-500" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
