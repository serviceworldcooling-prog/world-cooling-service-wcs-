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
  Wallet, CalendarCheck, Loader2, RefreshCw,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Banned',   label: 'Banned' },
];

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
    } catch { setCustomers([]); }
    finally { setLoading(false); }
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
    } catch (e: any) { alert(e.message); }
  };

  return (
    <DashboardLayout title="Customers" subtitle="View and manage registered customers">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',   value: total,    icon: Users,       color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'Active',  value: active,   icon: UserCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive',value: inactive, icon: UserX,       color: 'text-red-500',     bg: 'bg-red-50' },
          { label: 'Members', value: members,  icon: ShieldCheck, color: 'text-violet-600',  bg: 'bg-violet-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}><Icon size={18} className={color} /></div>
            <div><p className="text-xs font-600 text-slate-500">{label}</p><p className="text-xl font-800 text-slate-900">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <SearchFilter searchValue={search} onSearch={v => { setSearch(v); setPage(1); }}
            placeholder="Search by name, email, phone…"
            filterOptions={STATUS_OPTIONS} filterValue={filter} onFilter={v => { setFilter(v); setPage(1); }} filterLabel="Status"
            rightSlot={<button className="btn-secondary" onClick={load}><RefreshCw size={14} /></button>}
          />
          <p className="text-xs text-slate-400 mt-1">{total} customer{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Customer', 'Contact', 'City', 'Bookings', 'Total Spent', 'Wallet', 'Membership', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-slate-400 text-sm">No customers found</td></tr>
              ) : customers.map((c, i) => (
                <tr key={c._id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-800 text-primary-700 shrink-0">{c.name[0]}</div>
                      <div><p className="text-sm font-700 text-slate-800">{c.name}</p><p className="text-xs text-slate-400">Since {new Date(c.createdAt ?? c.joinDate).toLocaleDateString()}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><p className="text-xs text-slate-600">{c.email}</p><p className="text-xs text-slate-400">{c.phone}</p></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{c.city || '—'}</td>
                  <td className="px-5 py-4 text-sm font-700 text-slate-800">{c.totalBookings ?? 0}</td>
                  <td className="px-5 py-4 text-sm font-800 text-slate-900">${c.totalSpent ?? 0}</td>
                  <td className="px-5 py-4 text-sm font-700 text-emerald-600">${c.walletBalance ?? 0}</td>
                  <td className="px-5 py-4">{c.hasMembership ? <span className="text-xs font-700 px-2 py-1 rounded-lg bg-violet-50 text-violet-700">Member</span> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-5 py-4"><Badge variant={c.status === 'Active' ? 'active' : 'inactive'} label={c.status} dot /></td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setSelected(c); setViewOpen(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">Page {page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">←</button>
            <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 20} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">→</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Customer Profile" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-500 text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-800 text-xl">{selected.name[0]}</div>
              <div className="flex-1"><p className="text-lg font-800">{selected.name}</p><p className="text-sm text-primary-100">{selected.email}</p></div>
              <Badge variant={selected.status === 'Active' ? 'active' : 'inactive'} label={selected.status} dot />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CalendarCheck, label: 'Bookings',    value: selected.totalBookings ?? 0, color: 'text-primary-700', bg: 'bg-primary-50' },
                { icon: CalendarCheck, label: 'Total Spent', value: `$${selected.totalSpent ?? 0}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Wallet,        label: 'Wallet',      value: `$${selected.walletBalance ?? 0}`, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="p-3 rounded-xl border border-slate-100 text-center">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}><Icon size={16} className={color} /></div>
                  <p className="text-sm font-800 text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            {[
              { icon: Mail,         label: 'Email',      value: selected.email },
              { icon: Phone,        label: 'Phone',      value: selected.phone },
              { icon: MapPin,       label: 'City',       value: selected.city || '—' },
              { icon: CalendarDays, label: 'Joined',     value: new Date(selected.createdAt ?? selected.joinDate ?? Date.now()).toLocaleDateString() },
              { icon: ShieldCheck,  label: 'Membership', value: selected.hasMembership ? 'Active Member' : 'No Plan' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <Icon size={15} className="text-primary-600 shrink-0" />
                <span className="text-xs font-700 text-slate-400 w-24 shrink-0">{label}</span>
                <span className="text-sm font-600 text-slate-700">{value}</span>
              </div>
            ))}
            {/* Status actions */}
            <div className="flex gap-3 pt-2">
              {['Active', 'Inactive', 'Banned'].map(s => (
                <button key={s} onClick={() => handleStatusUpdate(selected._id, s as any)}
                  disabled={selected.status === s}
                  className={`flex-1 text-xs py-2 rounded-xl font-700 border transition-all disabled:opacity-40 ${s === 'Active' ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' : s === 'Banned' ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                  Set {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
