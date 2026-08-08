'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import SearchFilter from '@/components/SearchFilter';
import { getAmcPlans, createAmcPlan, deleteAmcPlan } from '@/lib/api';
import {
  ShieldCheck, Plus, CheckCircle, Users, Calendar, Sparkles, Trash2, Edit3, ArrowRight, ShieldAlert, Award, RefreshCw, Loader2, User
} from 'lucide-react';

interface AmcPlan {
  _id: string;
  title: string;
  subtitle: string;
  price: number;
  validityMonths: number;
  freeServices: number;
  discountOnParts: number;
  prioritySupport: boolean;
  gasTopUpIncluded: boolean;
  isActive: boolean;
  activeSubscribers: number;
}

interface Subscription {
  _id: string;
  customerName: string;
  phone: string;
  planTitle: string;
  startDate: string;
  endDate: string;
  remainingServices: number;
  totalServices: number;
  status: string;
  pricePaid: number;
}

export default function AmcPlansPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [plans, setPlans] = useState<AmcPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    price: 1999,
    validityMonths: 12,
    freeServices: 3,
    discountOnParts: 15,
    prioritySupport: true,
    gasTopUpIncluded: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAmcPlans();
      if (res?.data) {
        setPlans(res.data.plans || []);
        setSubscriptions(res.data.subscriptions || []);
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

  const handleCreatePlan = async () => {
    if (!form.title || !form.price) {
      alert('Please fill out the title and price.');
      return;
    }
    setSaving(true);
    try {
      await createAmcPlan(form);
      await loadData();
      setAddModalOpen(false);
      setForm({
        title: '',
        subtitle: '',
        price: 1999,
        validityMonths: 12,
        freeServices: 3,
        discountOnParts: 15,
        prioritySupport: true,
        gasTopUpIncluded: false,
      });
    } catch (e: any) {
      alert(e.message || 'Failed to create AMC Plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Are you sure you want to delete this AMC plan?')) {
      await deleteAmcPlan(id);
      setPlans(prev => prev.filter(p => p._id !== id));
    }
  };

  const filteredSubscriptions = subscriptions.filter(s =>
    s.customerName.toLowerCase().includes(search.toLowerCase()) ||
    s.planTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const totalActiveSubscribers = plans.reduce((acc, p) => acc + p.activeSubscribers, 0);
  const totalRevenue = subscriptions.reduce((acc, s) => acc + s.pricePaid, 0);

  return (
    <DashboardLayout title="AMC Maintenance Contracts" subtitle="Manage annual maintenance packages, coverage benefits, and active customer subscriptions">
      
      {/* ── Telemetry KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Active Subscribers', value: totalActiveSubscribers, color: 'text-teal-700', bg: 'bg-teal-50', icon: Users },
          { label: 'Available Packages', value: plans.length, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: ShieldCheck },
          { label: 'Contract Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Award },
          { label: 'Expiring Soon', value: subscriptions.filter(s => s.status === 'Expiring Soon').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: Calendar },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate mb-0.5 sm:mb-1">{label}</p>
              <p className={`text-lg sm:text-2xl font-800 leading-tight ${color} truncate`}>{value}</p>
            </div>
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Navigation Tabs & Action Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-700 transition-all ${
              activeTab === 'plans' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            AMC Packages ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-xl text-xs font-700 transition-all ${
              activeTab === 'subscriptions' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Subscriptions ({subscriptions.length})
          </button>
        </div>

        {activeTab === 'plans' && (
          <button 
            className="btn-primary py-2.5 px-4 text-xs font-700 rounded-xl gap-1.5 justify-center shadow-sm" 
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={15} /> Create AMC Package
          </button>
        )}
      </div>

      {/* ── Tab 1: AMC Packages Grid ── */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center text-slate-400">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs font-500">Loading AMC plans from database...</p>
            </div>
          ) : plans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-50 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-800 uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg">
                    {plan.validityMonths} Months Package
                  </span>
                  <button onClick={() => handleDeletePlan(plan._id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Delete Package">
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-base sm:text-lg font-800 text-slate-900 mb-1">{plan.title}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{plan.subtitle}</p>

                <div className="mb-5 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-800 text-slate-900">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400"> / year</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-5 sm:mb-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>{plan.freeServices} Free</strong> Wet & Dry Jet Visits</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    <span><strong>{plan.discountOnParts}% Discount</strong> Spare Parts & Repairs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle size={15} className={plan.gasTopUpIncluded ? 'text-emerald-500 shrink-0' : 'text-slate-300 shrink-0'} />
                    <span className={plan.gasTopUpIncluded ? 'font-600 text-slate-800' : 'line-through text-slate-400'}>Free Gas Top-up Included</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle size={15} className={plan.prioritySupport ? 'text-emerald-500 shrink-0' : 'text-slate-300 shrink-0'} />
                    <span className={plan.prioritySupport ? 'font-600 text-slate-800' : 'line-through text-slate-400'}>Priority 2-Hour Dispatch</span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-600 text-slate-700">{plan.activeSubscribers} Active Customers</span>
                <span className="font-700 text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Active <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 2: Subscriptions Container (Touched Left & Right on Mobile) ── */}
      {activeTab === 'subscriptions' && (
        <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
          {/* Toolbar Header */}
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Active Subscriptions Roster</h2>
                <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                  {filteredSubscriptions.length} subscriptions
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
                title="Refresh Subscriptions"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <SearchFilter
              searchValue={search}
              onSearch={setSearch}
              placeholder="Search subscriber by customer name or phone..."
            />
          </div>

          {/* ── Desktop Table View (Hidden on Mobile) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">AMC Plan</th>
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Valid Until</th>
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Services Left</th>
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Amount Paid</th>
                  <th className="py-3.5 px-5 text-[11px] font-800 uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                      <p className="text-xs text-slate-400 font-500">Loading customer subscriptions…</p>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No active subscriptions found</td>
                  </tr>
                ) : filteredSubscriptions.map((s, i) => (
                  <tr key={s._id} className={`hover:bg-slate-50/80 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                    <td className="py-3.5 px-5">
                      <p className="font-700 text-slate-900">{s.customerName}</p>
                      <p className="text-[11px] text-slate-400">{s.phone}</p>
                    </td>
                    <td className="py-3.5 px-5 font-800 text-teal-800">{s.planTitle}</td>
                    <td className="py-3.5 px-5 text-slate-600">{s.endDate}</td>
                    <td className="py-3.5 px-5 font-700 text-slate-700">{s.remainingServices} / {s.totalServices} visits left</td>
                    <td className="py-3.5 px-5 font-800 text-slate-900">₹{s.pricePaid.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-800 border ${
                        s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {s.status}
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
                <p className="text-xs text-slate-400 font-500">Loading customer subscriptions…</p>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No active subscriptions found</div>
            ) : (
              filteredSubscriptions.map((s) => (
                <div key={s._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  
                  {/* Top Row: Customer Name & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-teal-700 shrink-0" />
                      <span className="font-800 text-slate-900 text-xs">{s.customerName}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-800 border ${
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  {/* Plan Badge & Phone */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-800 text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md">
                      {s.planTitle}
                    </span>
                    <span className="text-slate-400 text-[11px]">{s.phone}</span>
                  </div>

                  {/* Services & Validity Box */}
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-700 uppercase">Visits Remaining</p>
                      <p className="font-800 text-slate-900">{s.remainingServices} / {s.totalServices} visits left</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-700 uppercase">Valid Until</p>
                      <p className="font-700 text-slate-700">{s.endDate}</p>
                    </div>
                  </div>

                  {/* Footer Amount */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Price Paid</span>
                    <span className="font-800 text-slate-900 text-sm">₹{s.pricePaid.toLocaleString('en-IN')}</span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Add AMC Package Modal ── */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create New AMC Package">
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Package Title *</label>
            <input
              type="text"
              placeholder="e.g. Premium Home Cooling Protection"
              className="input-field text-xs"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Subtitle / Summary</label>
            <input
              type="text"
              placeholder="e.g. 4 free services + 20% off all spare parts"
              className="input-field text-xs"
              value={form.subtitle}
              onChange={e => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
              <input
                type="number"
                className="input-field text-xs font-700"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Free Services/Year</label>
              <input
                type="number"
                className="input-field text-xs font-700"
                value={form.freeServices}
                onChange={e => setForm({ ...form, freeServices: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Spare Parts Discount (%)</label>
              <input
                type="number"
                className="input-field text-xs font-700"
                value={form.discountOnParts}
                onChange={e => setForm({ ...form, discountOnParts: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Validity (Months)</label>
              <input
                type="number"
                className="input-field text-xs font-700"
                value={form.validityMonths}
                onChange={e => setForm({ ...form, validityMonths: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-600 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.gasTopUpIncluded}
                onChange={e => setForm({ ...form, gasTopUpIncluded: e.target.checked })}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Include Free Gas Top-up
            </label>
            <label className="flex items-center gap-2 text-xs font-600 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.prioritySupport}
                onChange={e => setForm({ ...form, prioritySupport: e.target.checked })}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              Enable Priority Technician Dispatch
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
            <button className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl" onClick={handleCreatePlan} disabled={saving}>
              {saving ? 'Saving...' : 'Create Plan'}
            </button>
            <button className="btn-secondary justify-center py-2.5 px-5 text-xs rounded-xl" onClick={() => setAddModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}
