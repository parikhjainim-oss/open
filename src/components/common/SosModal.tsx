import React from 'react';
import { Shield, Phone, AlertTriangle, Share2, X, Check } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRideId?: string | null;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, activeRideId }) => {
  const [shared, setShared] = React.useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
        {/* Red header banner */}
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-full">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Suraksha Emergency SOS</h2>
              <p className="text-xs text-red-100">Gujarat State Police & Safety Shield</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-200/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-900 leading-relaxed">
              Pressing Emergency Call connects directly to Ahmedabad City Police Control Room and Gujarat Emergency Response (112). Your live GPS location and trip ID will be shared.
            </p>
          </div>

          {activeRideId && (
            <div className="bg-[#F7F8FA] p-3 rounded-xl flex items-center justify-between border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Trip ID</span>
              <span className="text-sm font-mono font-bold text-gray-900">{activeRideId}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <a
              href="tel:112"
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-98 transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>Call Police 112 (Emergency)</span>
            </a>

            <a
              href="tel:100"
              className="w-full h-12 bg-[#171717] hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Phone className="w-5 h-5 text-amber-400" />
              <span>Dial 100 Control Room</span>
            </a>

            <button
              onClick={handleShare}
              className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {shared ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-bold">Live GPS Telemetry Broadcasted!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Share Live Trip with Trusted Contacts</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-500 font-medium">
              M3 RIDE 24x7 Safety Command Center: 1800-419-7842
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
