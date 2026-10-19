import { Bike, CarFront } from 'lucide-react';

export function AppSplash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#171717] text-white">
      <div className="relative h-36 w-80 overflow-hidden">
        <div className="absolute bottom-3 h-1 w-full rounded bg-white/20" />
        <Bike className="splash-bike absolute bottom-6 left-0 text-[#FF6B00]" size={52} strokeWidth={2.4} />
        <CarFront className="splash-car absolute bottom-5 left-0 text-white" size={62} strokeWidth={2.1} />
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight">M3 RIDE</p>
      <p className="mt-2 text-sm font-medium tracking-[0.24em] text-orange-300">MOVE YOUR CITY</p>
    </div>
  );
}
