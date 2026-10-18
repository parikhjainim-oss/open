import React, { useState } from 'react';
import { store } from '../../services/store';
import { PricingRule, VehicleCategory } from '../../types';
import { Sliders, Calculator, Check, AlertCircle, Save } from 'lucide-react';

export const AdminPricing: React.FC = () => {
  const [pricingState, setPricingState] = useState(store.getState().pricing);
  const [testKm, setTestKm] = useState(8.4);
  const [testCategory, setTestCategory] = useState<VehicleCategory>('bike');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = (category: VehicleCategory, field: keyof PricingRule, value: any) => {
    setPricingState((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handlePublishPricing = () => {
    Object.keys(pricingState).forEach((cat) => {
      store.updatePricing(cat as VehicleCategory, pricingState[cat as VehicleCategory]);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentRules = pricingState[testCategory];
  const testCalculated = Math.round(
    Math.max(
      currentRules.minFare,
      currentRules.baseFare + testKm * currentRules.perKmRate + currentRules.platformLevy - 2
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Pricing & Service-Area Rules</h2>
          <p className="text-xs text-gray-500">Ahmedabad municipal fare structure & transparent rates</p>
        </div>
        <button
          type="button"
          onClick={handlePublishPricing}
          className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Publish Pricing Updates</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-green-600" />
          <span>Authoritative fare matrix updated across all rider and captain apps!</span>
        </div>
      )}

      {/* Vehicle Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['bike', 'auto', 'cab'] as const).map((cat) => {
          const rule = pricingState[cat];
          return (
            <div
              key={cat}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF6B00] text-[24px]">
                    {cat === 'bike' ? 'two_wheeler' : cat === 'auto' ? 'electric_rickshaw' : 'local_taxi'}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm">{rule.name}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {rule.capacity}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-500 font-semibold block mb-1">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={rule.baseFare}
                    onChange={(e) => handleUpdate(cat, 'baseFare', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-gray-500 font-semibold block mb-1">Per Kilometer Rate (₹/km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={rule.perKmRate}
                    onChange={(e) => handleUpdate(cat, 'perKmRate', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-gray-500 font-semibold block mb-1">Minimum Lock Fare (₹)</label>
                  <input
                    type="number"
                    value={rule.minFare}
                    onChange={(e) => handleUpdate(cat, 'minFare', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-gray-500 font-semibold block mb-1">Platform & Safety Levy (₹)</label>
                  <input
                    type="number"
                    value={rule.platformLevy}
                    onChange={(e) => handleUpdate(cat, 'platformLevy', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Fare Preview Calculator */}
      <div className="bg-[#F0F3FF] p-5 rounded-2xl border border-blue-100 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Calculator className="w-5 h-5 text-[#A04100]" />
          <span>Interactive Ahmedabad Fare Simulator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-gray-500 font-semibold block mb-1">Vehicle Category</label>
            <select
              value={testCategory}
              onChange={(e) => setTestCategory(e.target.value as VehicleCategory)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 font-bold"
            >
              <option value="bike">M3 Bike</option>
              <option value="auto">M3 Auto</option>
              <option value="cab">M3 Prime Cab</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500 font-semibold block mb-1">Trip Distance (km)</label>
            <input
              type="number"
              step="0.1"
              value={testKm}
              onChange={(e) => setTestKm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 font-bold font-mono"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Simulated Payable</span>
              <span className="text-xs text-gray-500">With WELCOME_AMD</span>
            </div>
            <span className="text-2xl font-black text-[#A04100] font-['Inter']">
              ₹{testCalculated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
