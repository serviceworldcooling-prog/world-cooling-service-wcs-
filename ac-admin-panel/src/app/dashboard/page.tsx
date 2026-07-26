'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { RevenueChart, WeeklyBookingsChart, ServiceDonutChart } from '@/components/Charts';
import Badge, { bookingStatusVariant } from '@/components/Badge';
import Image from 'next/image';
import {
  MOCK_STATS, MOCK_REVENUE_CHART, MOCK_SERVICE_DISTRIBUTION,
  MOCK_WEEKLY_BOOKINGS,
} from '@/lib/mockData';
import { getDashboardStats, getTechnicians, getBookings } from '@/lib/api';
import {
  CalendarCheck, DollarSign, Users, Wrench,
  Clock, CheckCircle2, XCircle, Star,
  TrendingUp, ArrowRight, Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats]               = useState<any>(MOCK_STATS);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [techs, setTechs]               = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>(MOCK_REVENUE_CHART);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, techData, bookData] = await Promise.allSettled([
          getDashboardStats(),
          getTechnicians('', '', 1, 6),
          getBookings({ page: 1, limit: 5 }),
        ]);

        if (dashData.status === 'fulfilled' && dashData.value) {
          setStats((prev: any) => ({ ...prev, ...dashData.value }));
          if (dashData.value.revenueChart?.length) setRevenueChart(dashData.value.revenueChart);
        }
        if (techData.status === 'fulfilled') {
          const d: any = techData.value;
          setTechs(d?.data ?? d?.technicians ?? []);
        }
        if (bookData.status === 'fulfilled') {
          const d: any = bookData.value;
          setRecentBookings(d?.data ?? d?.bookings ?? []);
        }
      } catch { /* fall back to mock */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Good morning, Super Admin 👋  — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
    >
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <Loader2 size={14} className="animate-spin" /> Loading live data…
        </div>
      )}

      {/* ─── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Bookings"    value={stats.totalBookings}                    growth={stats.bookingsGrowth}   subtitle="vs. last month" icon={<CalendarCheck size={20} className="text-primary-700" />} iconBg="bg-primary-50" prefix="" />
        <StatCard title="Total Revenue"     value={(stats.totalRevenue ?? 0).toLocaleString()} growth={stats.revenueGrowth}    subtitle="vs. last month" icon={<DollarSign   size={20} className="text-emerald-600" />} iconBg="bg-emerald-50" prefix="$" />
        <StatCard title="Total Customers"   value={stats.totalCustomers}                   growth={stats.customersGrowth}  subtitle="registered"     icon={<Users         size={20} className="text-blue-600"    />} iconBg="bg-blue-50" />
        <StatCard title="Active Technicians" value={stats.activeTechnicians}               growth={stats.techniciansGrowth ?? 0} subtitle="on platform" icon={<Wrench      size={20} className="text-violet-600" />} iconBg="bg-violet-50" />
      </div>

      {/* ─── Secondary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending',     value: stats.pendingBookings ?? 0,  icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-50' },
          { label: 'Done Today',  value: stats.completedToday ?? 0,   icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Cancel Rate', value: `${stats.cancelRate ?? 0}%`, icon: XCircle,       color: 'text-red-500',     bg: 'bg-red-50' },
          { label: 'Avg Rating',  value: stats.avgRating ?? 0,        icon: Star,          color: 'text-amber-500',   bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs font-600 text-slate-500">{label}</p>
              <p className="text-xl font-800 text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-800 text-slate-900">Revenue & Bookings</h3>
              <p className="text-xs text-slate-400 mt-0.5">12-month performance overview</p>
            </div>
          </div>
          <RevenueChart data={revenueChart} />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
          <h3 className="text-base font-800 text-slate-900 mb-1">Service Mix</h3>
          <p className="text-xs text-slate-400 mb-3">Breakdown by type</p>
          <ServiceDonutChart data={MOCK_SERVICE_DISTRIBUTION} />
          <div className="space-y-2 mt-2">
            {MOCK_SERVICE_DISTRIBUTION.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600 font-500">{item.name}</span>
                </span>
                <span className="font-700 text-slate-700">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Bookings + Weekly Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
          <h3 className="text-base font-800 text-slate-900 mb-1">This Week</h3>
          <p className="text-xs text-slate-400 mb-3">Daily bookings</p>
          <WeeklyBookingsChart data={MOCK_WEEKLY_BOOKINGS} />
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-primary-50">
            <TrendingUp size={16} className="text-primary-700" />
            <p className="text-xs font-600 text-primary-700">Saturday is peak day</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-800 text-slate-900">Recent Bookings</h3>
            <Link href="/bookings" className="flex items-center gap-1 text-xs font-700 text-primary-700 hover:text-primary-800 transition-colors">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No bookings yet</p>
            ) : recentBookings.map((b: any) => (
              <div key={b._id ?? b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-700 text-slate-600 shrink-0">
                  {(b.customerId?.name ?? b.customerName ?? 'C')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-700 text-slate-800 truncate">
                    {b.customerId?.name ?? b.customerName ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {b.serviceType ?? b.service} · {b.preferredDate ?? b.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={bookingStatusVariant(b.status)} label={b.status} dot />
                  <p className="text-sm font-800 text-slate-900 mt-1">${b.finalPrice ?? b.price ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Technician Status ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-800 text-slate-900">Technician Live Status</h3>
          <Link href="/technicians" className="flex items-center gap-1 text-xs font-700 text-primary-700 hover:text-primary-800">
            Manage <ArrowRight size={13} />
          </Link>
        </div>
        {techs.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">No technicians found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 divide-x divide-slate-50">
            {techs.map((t: any) => (
              <div key={t._id ?? t.id} className="p-4 flex flex-col items-center text-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-800 text-lg">
                    {(t.name ?? 'T')[0]}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    t.technicianStatus === 'Available' ? 'bg-emerald-500' :
                    t.technicianStatus === 'On Job'    ? 'bg-blue-500'    : 'bg-slate-400'
                  }`} />
                </div>
                <div>
                  <p className="text-xs font-700 text-slate-800 leading-tight">{t.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.specialty ?? '—'}</p>
                </div>
                <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${
                  t.technicianStatus === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                  t.technicianStatus === 'On Job'    ? 'bg-blue-50 text-blue-600'       : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.technicianStatus ?? 'Available'}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-700">
                  <Star size={10} fill="#FBBF24" />
                  {t.rating ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
