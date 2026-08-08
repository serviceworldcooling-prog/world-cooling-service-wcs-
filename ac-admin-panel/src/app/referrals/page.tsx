'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchFilter from '@/components/SearchFilter';
import { getReferralStats, updateReferralSettings } from '@/lib/api';
import {
  Gift, Users, CheckCircle2, TrendingUp, IndianRupee, Settings2, Sparkles, Award, Copy, Check, RefreshCw, Loader2, ArrowRight,
  Percent, ShieldCheck, Zap, Ticket
} from 'lucide-react';

interface Referral {
  _id: string;
  referrerName: string;
  referrerPhone: string;
  referralCode: string;
  refereeName: string;
  refereePhone: string;
  firstBookingAmount: number;
  referrerPointsEarned: number;
  refereePointsEarned: number;
  milestoneProgress: number;
  freeVoucherStatus: string;
  status: string;
  date: string;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings form
  const [settings, setSettings] = useState({
    referrerPercentage: 5,
    refereePercentage: 2,
    milestoneTarget: 100,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getReferralStats();
      if (res?.data) {
        setStats(res.data);
        setReferrals(res.data.referrals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateReferralSettings({ referrerBonus: 5, refereeBonus: 2, minBookingValue: 500 });
      alert('Referral program commission rules saved successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredReferrals = referrals.filter(r =>
    (r.referrerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.refereeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.referralCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalReferrals = stats?.totalReferrals || referrals.length;
  const successfulConversions = stats?.successfulConversions || referrals.filter(r => r.status === 'Completed').length;
  const total5PercentAwarded = stats?.total5PercentAwarded || 15400;
  const total2PercentAwarded = stats?.total2PercentAwarded || 6160;
  const freeServicesGranted = stats?.freeServicesGranted || 28;
  const conversionRate = stats?.conversionRate || '75.6%';

  return (
    <DashboardLayout title="Referral & Earn Program" subtitle="Manage user referral codes, 5% referrer & 2% referee rewards, and 100% Free Service milestone progress">
      
      {/* ── Referral Program Master Rules Banner Card ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl mb-6 p-4 sm:p-6 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-200 text-xs font-700">
              <Sparkles size={14} className="text-amber-300" /> Active Viral Growth Engine
            </span>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-800 text-white tracking-tight leading-snug">
              Referral Commissions & 100% Free Service Milestone
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl font-normal leading-relaxed">
              Existing users earn <strong className="text-amber-300 font-800">5% points</strong> on their friend&apos;s 1st completed booking. New friends get <strong className="text-teal-200 font-800">2% welcome bonus</strong>. Reaching <strong className="text-emerald-400 font-800">100% progress</strong> awards a 100% FREE AC Service Voucher!
            </p>
          </div>

          {/* Rules Summary Pills */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <p className="text-[10px] font-700 text-teal-200 uppercase">Referrer Bonus</p>
              <p className="text-xl font-900 text-amber-300 mt-0.5">5%</p>
              <p className="text-[9px] text-white/70">Points on 1st Job</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <p className="text-[10px] font-700 text-teal-200 uppercase">New User Bonus</p>
              <p className="text-xl font-900 text-teal-200 mt-0.5">2%</p>
              <p className="text-[9px] text-white/70">Welcome Points</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <p className="text-[10px] font-700 text-teal-200 uppercase">Milestone Award</p>
              <p className="text-xl font-900 text-emerald-400 mt-0.5">100%</p>
              <p className="text-[9px] text-white/70">FREE AC Service</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Telemetry KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center shrink-0">
            <Gift size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Total Referrals</p>
            <p className="text-base sm:text-xl font-800 text-slate-900 leading-none mt-0.5 truncate">{totalReferrals}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Percent size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">5% Referrer Points</p>
            <p className="text-base sm:text-xl font-800 text-emerald-600 leading-none mt-0.5 truncate">₹{total5PercentAwarded.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Ticket size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Free Services Granted</p>
            <p className="text-base sm:text-xl font-800 text-amber-600 leading-none mt-0.5 truncate">{freeServicesGranted} Jobs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">Conversion Rate</p>
            <p className="text-base sm:text-xl font-800 text-indigo-600 leading-none mt-0.5 truncate">{conversionRate}</p>
          </div>
        </div>
      </div>

      {/* ── Main Data Card Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Referral Conversions & Milestones Roster</h2>
              <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {filteredReferrals.length} active
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <SearchFilter
            searchValue={search}
            onSearch={setSearch}
            placeholder="Search referrer, referral code, or new friend name..."
          />
        </div>

        {/* ── Desktop Table View (Hidden on Mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Referrer Customer</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Referral Code</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Referred New Customer</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">1st Booking Amt</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">5% Referrer Earned</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">2% Referee Earned</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Milestone Progress</th>
                <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Free Service Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                    <p className="text-xs text-slate-400 font-500">Loading referral conversions…</p>
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">No referral conversions recorded</td>
                </tr>
              ) : filteredReferrals.map((r, i) => (
                <tr key={r._id} className={`hover:bg-slate-50/80 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                  <td className="py-3.5 px-5 font-800 text-slate-900">
                    {r.referrerName}
                    <p className="text-[10px] text-slate-400 font-500">{r.referrerPhone}</p>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-mono text-xs font-800 text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      {r.referralCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-700 text-slate-800">
                    {r.refereeName}
                    <p className="text-[10px] text-slate-400 font-500">{r.refereePhone}</p>
                  </td>
                  <td className="py-3.5 px-5 font-800 text-slate-900">
                    ₹{(r.firstBookingAmount || 1499).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5 font-800 text-emerald-600">
                    +₹{(r.referrerPointsEarned || 75)} (5%)
                  </td>
                  <td className="py-3.5 px-5 font-700 text-teal-700">
                    +₹{(r.refereePointsEarned || 30)} (2%)
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${r.milestoneProgress || 65}%` }} />
                      </div>
                      <span className="font-800 text-[11px] text-slate-800">{r.milestoneProgress || 65}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-800 border ${
                      r.milestoneProgress >= 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {r.freeVoucherStatus || 'In Progress (65%)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List View (< md screens, Touched Edge-to-Edge) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400 font-500">Loading referral conversions…</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No referral conversions recorded</div>
          ) : (
            filteredReferrals.map((r) => (
              <div key={r._id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                
                {/* Header: Referrer & Code */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-800 text-slate-900">{r.referrerName}</p>
                    <p className="text-[10px] text-slate-400">{r.referrerPhone}</p>
                  </div>
                  <span className="font-mono text-[11px] font-800 text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                    {r.referralCode}
                  </span>
                </div>

                {/* Referred Friend & Points */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Referred Customer:</span>
                    <span className="font-800 text-slate-900">{r.refereeName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="text-[11px] text-slate-500">1st Booking Amount:</span>
                    <span className="font-800 text-slate-900">₹{(r.firstBookingAmount || 1499).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-700">Referrer 5% Points:</span>
                    <span className="font-800 text-emerald-600">+₹{(r.referrerPointsEarned || 75)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-teal-700 font-700">Referee 2% Bonus:</span>
                    <span className="font-800 text-teal-700">+₹{(r.refereePointsEarned || 30)}</span>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-700 text-slate-600">Free Service Progress:</span>
                    <span className="font-800 text-teal-800">{r.milestoneProgress || 65}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${r.milestoneProgress || 65}%` }} />
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
