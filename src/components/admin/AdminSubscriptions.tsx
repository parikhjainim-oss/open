import React, { useState } from 'react';
import { store } from '../../services/store';
import { SubscriptionPlan } from '../../types';
import { CreditCard, Check, Plus, Users, ShieldCheck, DollarSign } from 'lucide-react';

export const AdminSubscriptions: React.FC = () => {
  const plans = store.getState().plans;
  const totalSubscribers = plans.reduce((sum, p) => sum + p.activeSubscribers, 0);
  const totalRevenue = plans.reduce((sum, p) => sum + p.price * p.activeSubscribers, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">Captain Subscription Administration</h2>
          <p className="text-xs text-gray-500">Zero-commission daily, weekly, and monthly captain pass models</p>
        </div>
      </div>

      {/* Revenue & Subscribers Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Active Subscriptions</span>
          <p className="text-3xl font-black text-gray-900 font-['Inter']">{totalSubscribers} Captains</p>
          <span className="text-xs text-green-600 font-bold">100% Zero-commission enabled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Recurring Pass Revenue</span>
          <p className="text-3xl font-black text-gray-900 font-['Inter']">₹{totalRevenue}</p>
          <span className="text-xs text-[#A04100] font-bold">Direct platform cashflow</span>
        </div>
      </div>

      {/* Plan Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
                <span className="text-lg font-black text-[#A04100] font-['Inter']">
                  ₹{plan.price}
                </span>
              </div>

              <div className="pt-2 text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Duration:</strong> {plan.durationText} ({plan.days} Days)
                </p>
                <p>
                  <strong>Active Subscribers:</strong> {plan.activeSubscribers} Captains
                </p>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Benefits</span>
                {plan.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-400">Estimated Captain Savings: 32%</span>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                Active Tier
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
