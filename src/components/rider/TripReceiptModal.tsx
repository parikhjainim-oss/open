import React, { useState } from 'react';
import { Ride } from '../../types';
import { store } from '../../services/store';
import { CheckCircle2, Star, Download, ArrowRight, ShieldCheck, ThumbsUp } from 'lucide-react';

interface TripReceiptModalProps {
  ride: Ride;
  onClose: () => void;
}

export const TripReceiptModal: React.FC<TripReceiptModalProps> = ({ ride, onClose }) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clean Helmet', 'Safe Driving']);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tags = [
    'Clean Helmet',
    'Safe Driving',
    'Polite Captain',
    'Smooth Route',
    'On Time Arrival'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    store.rateRide(ride.id, rating, `${selectedTags.join(', ')}. ${feedback}`);
    setSubmitted(true);
    setTimeout(() => {
      store.clearActiveRide();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Arrived at Destination!</h2>
          <p className="text-xs text-gray-500">
            {ride.drop.name}, {ride.drop.area}
          </p>
        </div>

        {/* Fare Card Receipt */}
        <div className="bg-[#F0F3FF] rounded-2xl p-4 border border-blue-100 space-y-2">
          <div className="flex items-center justify-between border-b border-blue-100 pb-2">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">Trip Fare Paid</span>
              <p className="text-2xl font-black text-gray-900 font-['Inter']">
                ₹{ride.fare.totalFare}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                Paid via {ride.paymentMethod}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">{ride.id}</p>
            </div>
          </div>

          <div className="space-y-1 text-xs text-gray-600 pt-1">
            <div className="flex justify-between">
              <span>Distance & Base</span>
              <span>₹{ride.fare.baseFare + ride.fare.distanceFare}.00</span>
            </div>
            <div className="flex justify-between">
              <span>Platform & Safety Levy</span>
              <span>₹{ride.fare.platformLevy}.00</span>
            </div>
            {ride.fare.discount > 0 && (
              <div className="flex justify-between text-[#A04100] font-semibold">
                <span>Promo Discount ({ride.fare.promoCode})</span>
                <span>-₹{ride.fare.discount}.00</span>
              </div>
            )}
          </div>
        </div>

        {/* Driver Review Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={ride.captainPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={ride.captainName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-gray-900">How was your trip with {ride.captainName || 'Captain'}?</p>
                <p className="text-[10px] text-gray-500">{ride.vehicleNumber} • {ride.vehicleModel}</p>
              </div>
            </div>
          </div>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 active:scale-95 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Compliment Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[11px] px-3 py-1 rounded-full font-semibold transition-all border ${
                  selectedTags.includes(tag)
                    ? 'bg-orange-50 border-[#FF6B00] text-[#A04100]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write a quick note for your captain (optional)..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FF6B00]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className="w-full h-12 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {submitted ? (
              <>
                <ThumbsUp className="w-4 h-4 text-white" />
                <span>Thank you! Feedback Saved</span>
              </>
            ) : (
              <>
                <span>Submit Rating & Done</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
