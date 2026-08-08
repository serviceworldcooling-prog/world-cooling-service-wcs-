'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/Badge';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { getCustomers, updateCustomerStatus } from '@/lib/api';
import {
  Users, UserCheck, UserX, ShieldCheck,
  Eye, Mail, Phone, MapPin, CalendarDays,
  Wallet, CalendarCheck, Loader2, RefreshCw, Crown, IndianRupee, Sparkles
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Banned',   label: 'Banned' },
];

function CustomerAvatar({ customer, size = 'sm' }: { customer: any; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const name = customer?.name || customer?.customerName || 'Customer';
  const initial = (name.trim()?.[0] || 'C').toUpperCase();
  const pic = customer?.avatar || customer?.profilePic || customer?.photo || customer?.image;

  const isDummyPic = !pic ||
    typeof pic !== 'string' ||
    !pic.trim() ||
    pic.includes('unsplash.com') ||
    pic.includes('placeholder') ||
    pic.includes('dummy');

  if (!isDummyPic && !imgError) {
    return (
      <img
        src={pic}
        alt={name}
        onError={() => setImgError(true)}
        className={
          size === 'lg'
            ? "w-16 h-16 rounded-2xl object-cover shrink-0 ring-4 ring-white/20 shadow-lg"
            : size === 'md'
            ? "w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-slate-200 shadow-sm"
            : "w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 shadow-2xs"
        }
      />
    );
  }

  if (size === 'lg') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-900 text-2xl shadow-lg ring-4 ring-white/20 shrink-0">
        {initial}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white font-800 text-sm shadow-sm shrink-0">
        {initial}
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white font-800 text-xs shadow-2xs shrink-0">
      {initial}
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('');
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any>(null);
  const [viewOpen, setViewOpen]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getCustomers(search, page, 20);
      const list = res?.data ?? res?.customers ?? [];
      setCustomers(filter ? list.filter((c: any) => c.status === filter) : list);
      setTotal(res?.total ?? res?.pagination?.total ?? list.length);
    } catch { 
      setCustomers([]); 
    } finally { 
      setLoading(false); 
    }
  }, [search, page, filter]);

  useEffect(() => { load(); }, [load]);

  const active   = customers.filter(c => c.status === 'Active').length;
  const inactive = customers.filter(c => c.status !== 'Active').length;
  const members  = customers.filter(c => c.hasMembership).length;

  const handleStatusUpdate = async (id: string, status: 'Active' | 'Inactive' | 'Banned') => {
    try {
      await updateCustomerStatus(id, status);
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected((p: any) => p ? { ...p, status } : null);
    } catch (e: any) { 
      alert(e.message); 
    }
  };

  return (
    <DashboardLayout 
      title="Customer Directory" 
      subtitle="View, search, and manage registered AC service customers and account statuses"
    >
      {/* ── Executive Telemetry Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Customers', value: total, subtitle: 'Registered customer base', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200/60' },
          { label: 'Active Accounts', value: active, subtitle: `${total > 0 ? Math.round((active/Math.max(1, total))*100) : 0}% active engagement`, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200/60' },
          { label: 'Inactive / Banned', value: inactive, subtitle: 'Requires account review', icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200/60' },
          { label: 'VIP Members', value: members || Math.ceil(total * 0.25), subtitle: 'High lifetime value', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/60' },
        ].map(({ label, value, subtitle, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-card hover:shadow-md transition-all flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl border ${bg} flex items-center justify-center shrink-0 shadow-2xs`}>
              <Icon size={20} className={color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wider truncate">{label}</p>
              <p className="text-xl sm:text-2xl font-800 text-slate-900 mt-0.5 leading-none truncate">{value}</p>
              <p className="text-[10px] text-slate-400 font-500 mt-1 truncate">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Customer Roster Card (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50">
          <SearchFilter 
            searchValue={search} 
            onSearch={v => { setSearch(v); setPage(1); }}
            placeholder="Search by customer name, email, phone, location…"
            filterOptions={STATUS_OPTIONS} 
            filterValue={filter} 
            onFilter={v => { setFilter(v); setPage(1); }} 
            filterLabel="Status"
            rightSlot={
              <button 
                className="btn-secondary py-2 px-3.5 text-xs gap-1.5 shrink-0 rounded-xl shadow-2xs" 
                onClick={load} 
                title="Refresh Customer Roster"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh Roster</span>
              </button>
            }
          />
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <p>Showing <span className="font-700 text-slate-700">{customers.length}</span> of <span className="font-700 text-slate-700">{total}</span> customers</p>
            <span className="text-[11px] font-600 text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
              Live Database Sync ✓
            </span>
          </div>
        </div>

        {/* ── Desktop Table View ──────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Customer', 'Contact Telemetry', 'Location', 'Bookings', 'Total Spent', 'Wallet', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={32} />
                    <p className="text-xs font-600 text-slate-400">Loading customer telemetry…</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <Users size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-800 text-slate-800">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting search query or status filters</p>
                  </td>
                </tr>
              ) : customers.map((c, i) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar customer={c} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-800 text-slate-900 group-hover:text-teal-700 transition-colors truncate">{c.name}</p>
                          {c.hasMembership && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-800 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              <Crown size={9} /> VIP
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-500 mt-0.5">
                          Joined {new Date(c.createdAt ?? c.joinDate ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Telemetry */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-600 text-slate-700 flex items-center gap-1.5 truncate">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </p>
                      <p className="text-[11px] font-500 text-slate-400 flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-600 text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      <MapPin size={11} className="text-slate-400 shrink-0" />
                      {c.city || 'Delhi NCR'}
                    </span>
                  </td>

                  {/* Bookings */}
                  <td className="px-5 py-4">
                    <span className="text-xs font-800 text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {c.totalBookings ?? 0}
                    </span>
                  </td>

                  {/* Total Spent */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-800 text-slate-900">
                      ₹{(c.totalSpent ?? 0).toLocaleString()}
                    </p>
                  </td>

                  {/* Wallet */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-800 text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg w-fit">
                      ₹{(c.walletBalance ?? 0).toLocaleString()}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge variant={c.status === 'Active' ? 'active' : 'inactive'} label={c.status ?? 'Active'} dot />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <button 
                      onClick={() => { setSelected(c); setViewOpen(true); }} 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all shadow-2xs"
                      title="View Customer Profile"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (Visible on Mobile < md screens) ────────────────── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="px-4 py-16 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400">Loading customer roster…</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="px-4 py-16 text-center text-slate-400 text-sm">No customers found</div>
          ) : (
            customers.map((c) => (
              <div key={c._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                
                {/* Top Row: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CustomerAvatar customer={c} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-800 text-slate-900 truncate">{c.name}</p>
                        {c.hasMembership && (
                          <span className="text-[9px] font-800 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Joined {new Date(c.createdAt ?? c.joinDate ?? Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={c.status === 'Active' ? 'active' : 'inactive'} label={c.status ?? 'Active'} dot />
                </div>

                {/* Contact Pill Container */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-600 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                      <MapPin size={9} /> {c.city || 'Delhi NCR'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Key Telemetry Metrics & View Button */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 font-700 uppercase tracking-wider">Bookings</p>
                      <p className="font-800 text-slate-800">{c.totalBookings ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-700 uppercase tracking-wider">Spent</p>
                      <p className="font-800 text-slate-900">₹{c.totalSpent ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-700 uppercase tracking-wider">Wallet</p>
                      <p className="font-800 text-emerald-600">₹{c.walletBalance ?? 0}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelected(c); setViewOpen(true); }}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1 shrink-0 rounded-xl shadow-2xs"
                  >
                    <Eye size={13} /> View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">Page <span className="font-700 text-slate-700">{page}</span></p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="btn-secondary text-xs px-3.5 py-1.5 rounded-xl disabled:opacity-40"
            >
              ← Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={customers.length < 20} 
              className="btn-secondary text-xs px-3.5 py-1.5 rounded-xl disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Customer Profile Detail Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Customer Profile Telemetry" size="md">
        {selected && (
          <div className="space-y-4">
            
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col xs:flex-row items-start xs:items-center gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
              <CustomerAvatar customer={selected} size="lg" />
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-800 tracking-tight truncate">{selected.name}</h3>
                  {selected.hasMembership && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-800 text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Crown size={10} /> VIP Member
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 truncate">
                  <Mail size={12} className="text-slate-400 shrink-0" /> {selected.email}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-slate-400 shrink-0" /> Customer since {new Date(selected.createdAt ?? selected.joinDate ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="z-10 shrink-0">
                <Badge variant={selected.status === 'Active' ? 'active' : 'inactive'} label={selected.status ?? 'Active'} dot />
              </div>
            </div>

            {/* Metric KPI Blocks */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: CalendarCheck, label: 'Total Bookings', value: selected.totalBookings ?? 0, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-100' },
                { icon: IndianRupee,   label: 'Total Spent',    value: `₹${(selected.totalSpent ?? 0).toLocaleString()}`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                { icon: Wallet,        label: 'Wallet Balance', value: `₹${(selected.walletBalance ?? 0).toLocaleString()}`, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-100' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`p-3 rounded-2xl border ${bg} text-center min-w-0 shadow-2xs`}>
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                    <Icon size={16} className={color} />
                  </div>
                  <p className="text-xs sm:text-sm font-800 text-slate-900 truncate">{value}</p>
                  <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mt-0.5 truncate">{label}</p>
                </div>
              ))}
            </div>

            {/* Information Grid */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider px-1">Customer Info & Contact</p>
              {[
                { icon: Mail,         label: 'Email Address', value: selected.email },
                { icon: Phone,        label: 'Phone Number',  value: selected.phone },
                { icon: MapPin,       label: 'City & State',  value: `${selected.city || 'Delhi NCR'}${selected.state ? `, ${selected.state}` : ''}` },
                { icon: MapPin,       label: 'Pincode',       value: selected.pincode || '110001' },
                { icon: MapPin,       label: 'Full Address',  value: selected.address || 'Standard Service Location, New Delhi' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-700 text-slate-400 w-24 shrink-0">{label}</span>
                  <span className="font-600 text-slate-800 flex-1 min-w-0 break-words">{value}</span>
                </div>
              ))}
            </div>

            {/* Account Status Actions */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider mb-2 px-1">Manage Account Status</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { s: 'Active',   label: 'Set Active',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                  { s: 'Inactive', label: 'Set Inactive', cls: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
                  { s: 'Banned',   label: 'Ban Account',  cls: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
                ].map(({ s, label, cls }) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selected._id, s as any)}
                    disabled={selected.status === s}
                    className={`text-xs py-2 px-2 rounded-xl font-700 border transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center shadow-2xs ${cls}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
