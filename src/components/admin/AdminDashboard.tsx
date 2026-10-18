import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { AppStoreState } from '../../services/store';
import {
  LayoutDashboard,
  MapPin,
  Car,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AdminLiveMap } from './AdminLiveMap';
import { AdminRides } from './AdminRides';
import { AdminCaptains } from './AdminCaptains';
import { AdminVerification } from './AdminVerification';
import { AdminPricing } from './AdminPricing';
import { AdminSubscriptions } from './AdminSubscriptions';
import { AdminSupport } from './AdminSupport';

type AdminTab =
  | 'overview'
  | 'live_ops'
  | 'rides'
  | 'captains'
  | 'verification'
  | 'pricing'
  | 'subscriptions'
  | 'support';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [state, setState] = useState<AppStoreState>(() => store.getState());
  const [adminRole, setAdminRole] = useState<'Super Admin' | 'Operations Manager' | 'Verification Agent' | 'Support Agent'>('Super Admin');

  useEffect(() => {
    return store.subscribe((newState) => {
      setState({ ...newState });
    });
  }, []);

  // Compute metrics from actual store records
  const totalRides = state.rides.length;
  const activeRides = state.rides.filter((r) =>
    ['REQUESTED', 'SEARCHING', 'ASSIGNED', 'CAPTAIN_ARRIVING', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)
  ).length;
  const completedRides = state.rides.filter((r) => r.status === 'COMPLETED').length;
  const cancelledRides = state.rides.filter((r) => r.status === 'CANCELLED').length;

  const totalCaptains = state.captains.length;
  const approvedCaptains = state.captains.filter((c) => c.status === 'approved').length;
  const onlineCaptains = state.captains.filter((c) => c.isOnline).length;
  const pendingDocs = state.documents.filter((d) => d.status === 'pending').length;
  const openTickets = state.tickets.filter((t) => t.status !== 'resolved').length;

  const grossBookingValue = state.rides
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.fare.totalFare, 0);

  const platformRevenue = Math.round(grossBookingValue * 0.05) + (completedRides * 3);
  const subscriptionRevenue = state.plans.reduce((sum, p) => sum + p.price * p.activeSubscribers, 0);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#171717] text-white flex flex-col shrink-0 border-r border-gray-800">
        {/* Brand header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-black text-sm shadow-md">
              M3
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                M3 FLEET ADMIN
              </span>
              <span className="text-[10px] text-gray-400">Ahmedabad Operations</span>
            </div>
          </div>
        </div>

        {/* Admin Role Selector */}
        <div className="px-4 py-3 bg-gray-900/60 border-b border-gray-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Active Role</span>
          <select
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as any)}
            className="w-full bg-[#171717] text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg border border-gray-700 outline-none"
          >
            <option>Super Admin</option>
            <option>Operations Manager</option>
            <option>Verification Agent</option>
            <option>Support Agent</option>
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
            { id: 'live_ops', label: 'Live Operations Map', icon: MapPin },
            { id: 'rides', label: 'Rides Management', icon: Car, badge: activeRides > 0 ? `${activeRides} Active` : undefined },
            { id: 'captains', label: 'Captains & Fleet', icon: Users, badge: `${onlineCaptains} Online` },
            { id: 'verification', label: 'Verification Queue', icon: ShieldCheck, badge: pendingDocs > 0 ? `${pendingDocs} Pending` : undefined, badgeColor: 'bg-amber-500' },
            { id: 'pricing', label: 'Pricing & Service Areas', icon: Sliders },
            { id: 'subscriptions', label: 'Captain Subscriptions', icon: CreditCard },
            { id: 'support', label: 'Support & Safety Incidents', icon: HelpCircle, badge: openTickets > 0 ? `${openTickets} Open` : undefined, badgeColor: 'bg-red-500' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF6B00] text-white font-bold shadow-md shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                      item.badgeColor || 'bg-gray-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-800 text-[11px] text-gray-500">
          <p>M3 RIDE Platform v2.4</p>
          <p className="text-gray-400">Ahmedabad, Gujarat</p>
        </div>
      </aside>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900 capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <span className="text-xs bg-orange-50 text-[#A04100] font-bold px-2 py-0.5 rounded-full border border-orange-200">
              Ahmedabad Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => store.resetToSeed()}
              className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed Data</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
                OP
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-gray-900 block leading-tight">Ahmedabad Dispatch</span>
                <span className="text-[10px] text-gray-500">{adminRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Panes */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Total Rides</span>
                    <Car className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-gray-900 font-['Inter']">
                      {totalRides}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {activeRides} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {completedRides} Completed • {cancelledRides} Cancelled
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Gross Booking Value</span>
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-gray-900 font-['Inter']">
                      ₹{grossBookingValue}
                    </span>
                    <span className="text-xs font-bold text-green-600">+18% Today</span>
                  </div>
                  <p className="text-[11px] text-gray-500">100% Transparent INR billing</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Active Captains</span>
                    <Users className="w-4 h-4 text-[#0053DB]" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-gray-900 font-['Inter']">
                      {onlineCaptains}
                    </span>
                    <span className="text-xs font-bold text-[#0053DB] bg-blue-50 px-2 py-0.5 rounded-full">
                      {approvedCaptains} Approved
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {pendingDocs > 0 ? `${pendingDocs} KYC Documents in review` : 'All KYC cleared'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                    <span>Subscription Revenue</span>
                    <CreditCard className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-gray-900 font-['Inter']">
                      ₹{subscriptionRevenue}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      252 Passes
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">Zero-commission business model</p>
                </div>
              </div>

              {/* Operations Quick Heatmap & Active Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Ahmedabad Live Fleet Heatmap</h2>
                      <p className="text-xs text-gray-500">High demand clusters & moving units</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('live_ops')}
                      className="text-xs font-bold text-[#FF6B00] hover:underline"
                    >
                      Open Full Live Map →
                    </button>
                  </div>

                  <AdminLiveMap embedded height="h-72" />
                </div>

                {/* Priority Incident & Verification Feed */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-gray-900">Attention Required</h2>

                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>Pending Captain KYC</span>
                        <span className="bg-amber-200 px-1.5 py-0.2 rounded text-[10px]">
                          {pendingDocs} Review(s)
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        Captain Jignesh Prajapati submitted Driving License & RC Book.
                      </p>
                      <button
                        onClick={() => setActiveTab('verification')}
                        className="text-[11px] text-amber-900 font-bold underline pt-1 block"
                      >
                        Review KYC Documents →
                      </button>
                    </div>

                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-red-900">
                        <span>Open Support Inquiry</span>
                        <span className="bg-red-200 px-1.5 py-0.2 rounded text-[10px]">
                          {openTickets} Open
                        </span>
                      </div>
                      <p className="text-red-800 text-[11px]">
                        Meera Trivedi: UPI transaction debited twice for ride M3-R-8419.
                      </p>
                      <button
                        onClick={() => setActiveTab('support')}
                        className="text-[11px] text-red-900 font-bold underline pt-1 block"
                      >
                        Resolve Support Ticket →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Dispatched Rides Table Preview */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Recent Dispatches</h2>
                  <button
                    onClick={() => setActiveTab('rides')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    View All Dispatches ({totalRides}) →
                  </button>
                </div>
                <AdminRides limit={3} />
              </div>
            </div>
          )}

          {activeTab === 'live_ops' && <AdminLiveMap />}
          {activeTab === 'rides' && <AdminRides />}
          {activeTab === 'captains' && <AdminCaptains />}
          {activeTab === 'verification' && <AdminVerification />}
          {activeTab === 'pricing' && <AdminPricing />}
          {activeTab === 'subscriptions' && <AdminSubscriptions />}
          {activeTab === 'support' && <AdminSupport />}
        </div>
      </main>
    </div>
  );
};
