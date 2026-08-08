'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { getComplaints, updateComplaintStatus, saveComplaintAdminNote, deleteComplaint } from '@/lib/api';
import {
  Eye, Trash2, Save, Loader2, RefreshCw, AlertTriangle, MessageSquareWarning,
  Clock, CheckCircle2, ShieldCheck, User, Calendar, Tag, AlertCircle, FileText
} from 'lucide-react';

type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const STATUS_COLORS: Record<Status, string> = {
  Open:          'bg-rose-50 text-rose-700 border-rose-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed:        'bg-slate-100 text-slate-600 border-slate-200',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected]     = useState<any>(null);
  const [viewOpen, setViewOpen]     = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [adminNote, setAdminNote]   = useState('');
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getComplaints({ search, status: statusFilter, page: 1, limit: 50 });
      const list = res?.data ?? res?.complaints ?? [];
      setComplaints(list);
      setTotal(res?.total ?? list.length);
    } catch { 
      setComplaints([]); 
    } finally { 
      setLoading(false); 
    }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const stats = {
    total:    total,
    open:     complaints.filter(c => c.status === 'Open' || c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    closed:   complaints.filter(c => c.status === 'Closed').length,
  };

  const handleView = (c: any) => { setSelected(c); setAdminNote(c.adminNote ?? ''); setViewOpen(true); };

  const handleStatusUpdate = async (id: string, status: Status) => {
    try {
      await updateComplaintStatus(id, status, adminNote);
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected((p: any) => p ? { ...p, status } : null);
    } catch (e: any) { alert(e.message); }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveComplaintAdminNote(selected._id, adminNote);
      setComplaints(prev => prev.map(c => c._id === selected._id ? { ...c, adminNote } : c));
      setSelected((p: any) => p ? { ...p, adminNote } : null);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteComplaint(deleteId);
      setDeleteId(null);
      setViewOpen(false);
      load();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <DashboardLayout title="Complaints Management" subtitle="Track and resolve customer support tickets, service issues, and technician feedback">
      
      {/* ── Telemetry KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Complaints', value: stats.total, color: 'text-teal-700', bg: 'bg-teal-50', icon: MessageSquareWarning },
          { label: 'Open / In Progress', value: stats.open, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
          { label: 'Resolved Tickets', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Closed Tickets', value: stats.closed, color: 'text-slate-600', bg: 'bg-slate-100', icon: ShieldCheck },
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

      {/* ── Main Data Card Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden">
        {/* Toolbar Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Customer Complaints Queue</h2>
              <span className="text-[11px] font-700 text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {total} tickets
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary py-2 px-3 text-xs gap-1.5 shrink-0 rounded-xl"
              title="Refresh List"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <SearchFilter
            searchValue={search}
            onSearch={v => setSearch(v)}
            placeholder="Search by customer name, phone, ticket ID, or subject..."
            filterOptions={[
              { value: 'Open', label: 'Open' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Closed', label: 'Closed' },
            ]}
            filterValue={statusFilter}
            onFilter={setFilter}
            filterLabel="Status"
          />
        </div>

        {/* ── Desktop Table View (Hidden on Mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Ticket #</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Subject & Category</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Filed Date</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
                    <p className="text-xs text-slate-400 font-500">Loading complaints queue…</p>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No complaint tickets found
                  </td>
                </tr>
              ) : complaints.map((c, i) => {
                const customer = c.customer ?? {};
                const ticketNo = c.ticketNumber ?? `TKT-${c._id?.slice(-6).toUpperCase()}`;
                return (
                  <tr key={c._id} className={`hover:bg-slate-50/80 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                    <td className="px-5 py-4 font-mono font-800 text-teal-800">
                      <span className="bg-teal-50 border border-teal-200/60 px-2 py-1 rounded-lg">
                        {ticketNo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-800 text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {(customer.name ?? 'C')[0]}
                        </div>
                        <div>
                          <p className="font-800 text-slate-900">{customer.name ?? 'Guest User'}</p>
                          <p className="text-[11px] text-slate-400">{customer.phone || customer.mobile || '+91 98765 43210'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[240px]">
                      <span className="inline-block text-[10px] font-700 uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-0.5">
                        {c.category || 'General Issue'}
                      </span>
                      <p className="font-700 text-slate-800 truncate">{c.subject}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-500">
                      {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-800 border ${STATUS_COLORS[c.status as Status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(c)}
                          className="btn-secondary py-1 px-3 text-xs gap-1.5 rounded-xl font-700"
                          title="Review Complaint"
                        >
                          <Eye size={14} /> Review
                        </button>
                        <button
                          onClick={() => setDeleteId(c._id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List View (< md screens, Touched Edge-to-Edge) ── */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto animate-spin text-teal-600 mb-2" size={28} />
              <p className="text-xs text-slate-400 font-500">Loading complaints queue…</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No complaint tickets found</div>
          ) : (
            complaints.map((c) => {
              const customer = c.customer ?? {};
              const ticketNo = c.ticketNumber ?? `TKT-${c._id?.slice(-6).toUpperCase()}`;
              return (
                <div key={c._id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  
                  {/* Top Row: Ticket # & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-800 text-teal-800 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-lg">
                      {ticketNo}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-800 border ${STATUS_COLORS[c.status as Status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Customer Info Card */}
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-teal-700" />
                        <span className="font-800 text-slate-900">{customer.name ?? 'Guest Customer'}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{customer.phone || customer.mobile || '+91 98765 43210'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="font-700 text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                        {c.category || 'General Issue'}
                      </span>
                      <span className="text-slate-400 font-500">
                        {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <p className="text-xs font-700 text-slate-800 leading-snug line-clamp-2 px-1">
                    "{c.subject}"
                  </p>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleView(c)}
                      className="btn-primary py-1.5 px-3.5 text-xs gap-1.5 flex-1 justify-center rounded-xl shadow-2xs"
                    >
                      <Eye size={14} /> Review Complaint
                    </button>
                    <button
                      onClick={() => setDeleteId(c._id)}
                      className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-700 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center shrink-0"
                      title="Delete Ticket"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── View / Manage Complaint Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={`Complaint Ticket — ${selected?.ticketNumber || selected?._id?.slice(-6)}`} size="lg">
        {selected && (
          <div className="space-y-4 pt-1">
            
            {/* Header info box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-800 text-teal-700 uppercase tracking-widest bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  {selected.category || 'General Issue'}
                </span>
                <p className="text-xs sm:text-sm font-800 text-slate-900 mt-1.5">{selected.subject}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-800 border shrink-0 ${STATUS_COLORS[selected.status as Status] ?? ''}`}>
                {selected.status}
              </span>
            </div>

            {/* Description box */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} /> Customer Reported Issue Details
              </p>
              <p className="text-xs text-slate-700 leading-relaxed font-500 whitespace-pre-wrap">{selected.description}</p>
            </div>

            {/* Internal Admin Note */}
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">
                Internal Admin Notes & Investigation Remarks
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  rows={2}
                  className="input-field text-xs resize-none flex-1"
                  placeholder="e.g. Serviceman assigned for re-inspection on customer site..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="btn-primary py-2 px-4 text-xs font-700 shrink-0 justify-center gap-1.5 rounded-xl"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Note
                </button>
              </div>
            </div>

            {/* Ticket Action Status Transitions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">Update Ticket Status</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'In Progress')}
                  disabled={selected.status === 'In Progress' || selected.status === 'Resolved' || selected.status === 'Closed'}
                  className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl disabled:opacity-40"
                >
                  Investigate (In Progress)
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'Resolved')}
                  disabled={selected.status === 'Resolved' || selected.status === 'Closed'}
                  className="flex-1 text-xs py-2.5 rounded-xl font-700 border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate(selected._id, 'Closed')}
                  disabled={selected.status === 'Closed'}
                  className="btn-danger py-2.5 px-4 text-xs font-700 rounded-xl disabled:opacity-40 justify-center"
                >
                  Close Ticket
                </button>
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Complaint Ticket" size="sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle size={26} />
          </div>
          <div>
            <p className="text-sm font-800 text-slate-900">Delete this complaint ticket permanently?</p>
            <p className="text-xs text-slate-400 mt-1">This action cannot be undone and will remove the record from customer logs.</p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button className="btn-secondary flex-1 justify-center py-2.5 text-xs" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button className="btn-danger flex-1 justify-center py-2.5 text-xs" onClick={handleDelete}>
              Delete Ticket
            </button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}
