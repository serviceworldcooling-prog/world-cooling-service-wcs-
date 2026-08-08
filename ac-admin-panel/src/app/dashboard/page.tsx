'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { RevenueChart, WeeklyBookingsChart, ServiceDonutChart } from '@/components/Charts';
import Badge, { bookingStatusVariant } from '@/components/Badge';
import {
  MOCK_STATS, MOCK_REVENUE_CHART, MOCK_SERVICE_DISTRIBUTION,
  MOCK_WEEKLY_BOOKINGS, MOCK_BOOKINGS, MOCK_TECHNICIANS
} from '@/lib/mockData';
import { getDashboardStats, getTechnicians, getBookings } from '@/lib/api';
import {
  CalendarCheck, IndianRupee, Users, Wrench,
  Clock, CheckCircle2, XCircle, Star,
  TrendingUp, ArrowRight, Loader2, Plus, Zap, ClipboardCheck, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

function DashboardUserAvatar({
  name,
  avatar,
  type = 'customer',
  className = '',
}: {
  name?: string;
  avatar?: string | null;
  type?: 'customer' | 'technician';
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const cleanName = (name && name.trim()) ? name.trim() : (type === 'customer' ? 'Customer' : 'Technician');
  const initial = (cleanName[0] || (type === 'customer' ? 'C' : 'T')).toUpperCase();

  const isDummyPic = !avatar ||
    typeof avatar !== 'string' ||
    !avatar.trim() ||
    avatar.includes('unsplash.com') ||
    avatar.includes('placeholder') ||
    avatar.includes('dummy');

  if (!isDummyPic && !imgError) {
    return (
      <img
        src={avatar!}
        alt=""
        onError={() => setImgError(true)}
        className={`object-cover shrink-0 ${className}`}
      />
    );
  }

  const bgClasses = type === 'customer'
    ? 'bg-gradient-to-tr from-teal-700 to-teal-500 text-white'
    : 'bg-gradient-to-tr from-slate-900 to-slate-700 text-white';

  return (
    <div className={`flex items-center justify-center font-800 shrink-0 ${bgClasses} ${className}`}>
      {initial}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]                               = useState<any>(MOCK_STATS);
  const [recentBookings, setRecentBookings]         = useState<any[]>(MOCK_BOOKINGS.slice(0, 5));
  const [techs, setTechs]                             = useState<any[]>(MOCK_TECHNICIANS.slice(0, 6));
  const [revenueChart, setRevenueChart]               = useState<any[]>(MOCK_REVENUE_CHART);
  const [weeklyBookings, setWeeklyBookings]           = useState<any[]>(MOCK_WEEKLY_BOOKINGS);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>(MOCK_SERVICE_DISTRIBUTION);
  const [loading, setLoading]                         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, techData, bookData] = await Promise.allSettled([
          getDashboardStats(),
          getTechnicians('', '', 1, 6),
          getBookings({ page: 1, limit: 5 }),
        ]);

        if (dashData.status === 'fulfilled' && dashData.value) {
          const val = dashData.value?.data ?? dashData.value;
          setStats((prev: any) => ({ ...prev, ...val }));
          if (val.revenueChart?.length) setRevenueChart(val.revenueChart);
          if (val.weeklyBookingsChart?.length) setWeeklyBookings(val.weeklyBookingsChart);
          if (val.serviceDistribution?.length) setServiceDistribution(val.serviceDistribution);
          if (val.recentBookings?.length) setRecentBookings(val.recentBookings);
        }

        if (techData.status === 'fulfilled') {
          const d: any = techData.value;
          if (d?.data?.length || d?.technicians?.length) {
            setTechs(d?.data ?? d?.technicians ?? []);
          }
        }

        if (bookData.status === 'fulfilled') {
          const d: any = bookData.value;
          if (d?.data?.length || d?.bookings?.length) {
            setRecentBookings(d?.data ?? d?.bookings ?? []);
          }
        }
      } catch { 
        /* fall back gracefully */ 
      } finally { 
        setLoading(false); 
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle={`Welcome back, Super Admin 👋 — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}`}
    >
      {loading && (
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-600 text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200/60 mb-5 w-fit animate-pulse truncate whitespace-nowrap">
          <Loader2 size={14} className="animate-spin shrink-0" /> Fetching live telemetry & metrics…
        </div>
      )}

      {/* ─── Quick Operational Shortcuts Bar (Touched Left & Right on Mobile — Light Theme) ─── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl mb-6 p-3.5 sm:p-5 bg-gradient-to-r from-white via-teal-50/50 to-slate-50 border-y sm:border border-teal-200/70 text-slate-900 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <Zap size={18} fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight truncate whitespace-nowrap">Quick Operations Hub</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-500 truncate whitespace-nowrap">Dispatch engineers, view work reports, or check complaint queue</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
          <Link href="/bookings?action=new" className="flex-1 sm:flex-initial">
            <button className="w-full btn-primary py-2 px-3 text-[10px] sm:text-xs font-700 rounded-xl shadow-xs justify-center truncate whitespace-nowrap">
              <Plus size={14} className="shrink-0" /> Book Service
            </button>
          </Link>
          <Link href="/work-reports" className="flex-1 sm:flex-initial">
            <button className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2 px-3 text-[10px] sm:text-xs font-700 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 truncate whitespace-nowrap">
              <ClipboardCheck size={14} className="text-teal-700 shrink-0" /> Work Reports
            </button>
          </Link>
          <Link href="/complaints" className="w-full sm:w-auto">
            <button className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 py-2 px-3 text-[10px] sm:text-xs font-700 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 truncate whitespace-nowrap">
              <ShieldAlert size={14} className="text-rose-600 shrink-0" /> Complaints ({stats.openComplaints ?? 3})
            </button>
          </Link>
        </div>
      </div>

      {/* ─── Executive KPI Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings ?? 1248} 
          growth={stats.bookingsGrowth ?? 14.2} 
          subtitle="live MongoDB bookings" 
          icon={<CalendarCheck size={20} className="text-teal-700" />} 
          iconBg="bg-teal-50 text-teal-700 border-teal-200/60"
        />
        <StatCard 
          title="Total Revenue" 
          value={((stats.totalRevenue ?? 348500)).toLocaleString('en-IN')} 
          growth={stats.revenueGrowth ?? 18.5} 
          subtitle="live payment ledger" 
          icon={<IndianRupee size={20} className="text-emerald-700" />} 
          iconBg="bg-emerald-50 text-emerald-700 border-emerald-200/60"
          prefix="₹"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers ?? 892} 
          growth={stats.customersGrowth ?? 9.4} 
          subtitle="registered accounts" 
          icon={<Users size={20} className="text-sky-700" />} 
          iconBg="bg-sky-50 text-sky-700 border-sky-200/60"
        />
        <StatCard 
          title="Active Technicians" 
          value={stats.activeTechnicians ?? 24} 
          growth={stats.techniciansGrowth ?? 4.5} 
          subtitle="on-duty engineers" 
          icon={<Wrench size={20} className="text-amber-700" />} 
          iconBg="bg-amber-50 text-amber-700 border-amber-200/60"
        />
      </div>

      {/* ─── Operational Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Pending Bookings', value: stats.pendingBookings ?? 18, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/60' },
          { label: 'Completed Today',  value: stats.completedToday ?? 32, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200/60' },
          { label: 'Cancellation Rate', value: `${stats.cancelRate ?? 2.1}%`, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200/60' },
          { label: 'Avg Rating', value: `${stats.avgRating ?? 4.85} ★`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200/60' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate whitespace-nowrap">{label}</p>
              <p className="text-base sm:text-xl font-800 text-slate-900 mt-0.5 truncate whitespace-nowrap leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Section (Touched Left & Right on Mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl lg:col-span-2 bg-white p-4 sm:p-5 border-y sm:border border-slate-200/70 shadow-card">
          <div className="flex flex-row items-center justify-between gap-2 mb-4 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-800 text-slate-900 tracking-tight truncate whitespace-nowrap">Revenue & Booking Trends</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-500 mt-0.5 truncate whitespace-nowrap">12-month live MongoDB aggregated revenue & bookings telemetry</p>
            </div>
            <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[9px] sm:text-[11px] font-800 border border-teal-200/60 shrink-0 truncate whitespace-nowrap">
              Live Database Telemetry
            </span>
          </div>
          <div className="-ml-2 sm:ml-0 overflow-hidden">
            <RevenueChart data={revenueChart} />
          </div>
        </div>

        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white p-4 sm:p-5 border-y sm:border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-base font-800 text-slate-900 tracking-tight mb-0.5 truncate whitespace-nowrap">Service Breakdown</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-500 mb-2 truncate whitespace-nowrap">Real category distribution</p>
            <ServiceDonutChart data={serviceDistribution} />
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {serviceDistribution.slice(0, 4).map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-xs min-w-0">
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-slate-600 font-600 text-[11px] sm:text-xs truncate whitespace-nowrap">{item.name}</span>
                </span>
                <span className="font-800 text-slate-800 text-[11px] sm:text-xs shrink-0 ml-2 truncate whitespace-nowrap">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Weekly Telemetry + Recent Bookings (Touched Left & Right on Mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white p-4 sm:p-5 border-y sm:border border-slate-200/70 shadow-card flex flex-col justify-between">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-base font-800 text-slate-900 tracking-tight mb-0.5 truncate whitespace-nowrap">Weekly Demand Peak</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-500 mb-3 truncate whitespace-nowrap">Daily live booking load distribution</p>
            <div className="-ml-2 sm:ml-0 overflow-hidden">
              <WeeklyBookingsChart data={weeklyBookings} />
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-teal-50 border border-teal-200/60 mt-4 min-w-0">
            <TrendingUp size={15} className="text-teal-700 shrink-0" />
            <p className="text-[10px] sm:text-xs font-700 text-teal-800 truncate whitespace-nowrap">Weekend slots experience peak demand.</p>
          </div>
        </div>

        {/* Recent Bookings Feed (Touched Left & Right on Mobile) */}
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl lg:col-span-2 bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-800 text-slate-900 tracking-tight truncate whitespace-nowrap">Recent Service Bookings</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-500 truncate whitespace-nowrap">Live feed of customer requests</p>
            </div>
            <Link href="/bookings" className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-700 text-teal-700 hover:text-teal-800 transition-colors shrink-0 truncate whitespace-nowrap">
              View All <span className="hidden sm:inline">Bookings</span> <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentBookings.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-10">No recent bookings recorded.</p>
            ) : recentBookings.map((b: any) => (
              <div key={b._id ?? b.id} className="flex flex-row items-center justify-between gap-3 px-3.5 sm:px-5 py-3 hover:bg-slate-50/70 transition-colors min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <DashboardUserAvatar
                    name={b.customerId?.name ?? b.customerName}
                    avatar={b.customerId?.avatar || b.customerId?.profilePic || b.customerAvatar || b.avatar}
                    type="customer"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl shadow-2xs text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-800 text-slate-900 truncate whitespace-nowrap">
                      {b.customerId?.name ?? b.customerName ?? 'Customer'}
                    </p>
                    <p className="text-[9px] sm:text-[11px] font-500 text-slate-400 truncate whitespace-nowrap">
                      {b.serviceType ?? b.service ?? 'AC Service'} · {b.address?.city ?? b.location ?? 'Delhi NCR'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
                  <Badge variant={bookingStatusVariant(b.status)} label={b.status} dot />
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-700 text-slate-600 truncate whitespace-nowrap">
                      Amt: <span className="font-800 text-slate-900">₹{b.price ?? b.estimatedPrice ?? 0}</span>
                    </p>
                    <p className="text-[9px] sm:text-[11px] font-700 text-teal-700 truncate whitespace-nowrap">
                      {(b.finalPrice || b.assignedPrice) ? `₹${b.finalPrice ?? b.assignedPrice}` : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Live Engineer Roster (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-base font-800 text-slate-900 tracking-tight truncate whitespace-nowrap">On-Duty Field Engineers</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-500 truncate whitespace-nowrap">Live availability and job assignments</p>
          </div>
          <Link href="/technicians" className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-700 text-teal-700 hover:text-teal-800 shrink-0 truncate whitespace-nowrap">
            Manage <span className="hidden sm:inline">Technicians</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-100">
          {techs.map((t: any) => (
            <div key={t._id ?? t.id} className="bg-white p-3 sm:p-4 flex flex-col items-center text-center gap-1.5 hover:bg-slate-50/80 transition-colors min-w-0">
              <div className="relative shrink-0">
                <DashboardUserAvatar
                  name={t.name}
                  avatar={t.avatar || t.profilePic || t.photo || t.image}
                  type="technician"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-2xs text-xs sm:text-sm border border-slate-200"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ring-2 ring-white ${
                  t.technicianStatus === 'Available' ? 'bg-emerald-500' :
                  t.technicianStatus === 'On Job'    ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'
                }`} />
              </div>
              <div className="w-full min-w-0">
                <p className="text-[11px] sm:text-xs font-800 text-slate-900 leading-tight truncate whitespace-nowrap">{t.name}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate whitespace-nowrap">{t.specialty ?? 'Senior AC Tech'}</p>
              </div>
              <span className={`text-[9px] sm:text-[10px] font-700 px-2 py-0.5 rounded-full border truncate whitespace-nowrap ${
                t.technicianStatus === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                t.technicianStatus === 'On Job'    ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {t.technicianStatus ?? 'Available'}
              </span>
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-600 font-700 truncate whitespace-nowrap">
                <Star size={10} fill="#F59E0B" className="text-amber-500 shrink-0" />
                <span>{t.rating ?? 4.9}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
