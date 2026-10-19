import React, { useState } from 'react';
import { Header } from '../common/Header';
import { store } from '../../services/store';
import { AuthUser } from '../../services/api';
import { User, Phone, ShieldCheck, FileText, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

interface CaptainProfileProps {
  onBack: () => void;
  onLogout?: () => void;
  account: AuthUser;
}

export const CaptainProfile: React.FC<CaptainProfileProps> = ({ onBack, onLogout, account }) => {
  const captain = store.getState().captains[0];
  const documents = store.getState().documents.filter((d) => d.captainId === captain.id);
  const accountName = account.driver?.name || account.email;
  const accountPhone = account.driver?.phone;

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA]">
      <Header title="Driver Profile & Vehicle" onBack={onBack} userPhoto={captain.photo} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-20 pb-8 px-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <img
            src={captain.photo}
            alt={accountName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{accountName}</h2>
            <p className="text-xs text-gray-500 font-mono">{accountPhone || 'Phone number not added'}</p>
            <p className="mt-1 truncate text-xs text-gray-500">{account.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                ★ {captain.rating} Rating
              </span>
              <span className="text-[10px] bg-blue-100 text-[#0053DB] font-bold px-2 py-0.5 rounded-full">
                {captain.totalTrips}+ Trips
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Credentials */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Registered Vehicle</h3>
          <div className="p-3 bg-[#F0F3FF] rounded-xl flex items-center justify-between border border-blue-100">
            <div>
              <span className="text-xs font-bold text-gray-900">{account.driver?.vehicleType || 'Vehicle not added'}</span>
              <p className="text-[11px] text-gray-500">Category: {account.driver?.vehicleType ? `${account.driver.vehicleType.toUpperCase()} Taxi` : 'Not provided'}</p>
            </div>
            <div className="bg-[#FFEB3B] text-black px-2.5 py-1 rounded shadow-sm border border-amber-300 text-center font-bold font-mono text-xs">
              {account.driver?.vehicleNumber || 'Not added'}
            </div>
          </div>
        </div>

        {/* Verification Status & Documents */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Verification Documents</h3>
            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" /> Approved
            </span>
          </div>

          <div className="space-y-2">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#A04100]" />
                    <div>
                      <p className="font-bold text-gray-900">{doc.docType}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{doc.docNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : doc.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {doc.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">All standard KYC documents submitted & verified.</p>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout || onBack}
          className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Captain Session</span>
        </button>
      </main>
    </div>
  );
};
