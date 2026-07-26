'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { getComplaints, updateComplaintStatus, saveComplaintAdminNote, deleteComplaint } from '@/lib/api';
import {
  Eye, Trash2, Save, Loader2, RefreshCw, AlertTriangle,
} from 'lucide-react';

type Status = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

const STATUS_COLORS: Record<Status, string> = {
  Open:          'bg-red-50 text-red-700 border-red-100',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
  Resolved:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  Closed:        'bg-slate-50 text-slate-700 border-slate-100',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low:    'bg-slate-50 text-slate-700',
  Medium: 'bg-amber-50 text-amber-700',
  High:   'bg-orange-50 text-orange-700',
  Urgent: 'bg-red-50 text-red-700 font-bold',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<any>(null);
  const [viewOpen, setViewOpen]     = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [adminNote, setAdminNote]   = useState('');
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getComplaints({ search, status: statusFilter, page: 1, limit: 30 });
      const list = res?.data ?? res?.complaints ?? [];
      setComplaints(list);
      setTotal(res?.total ?? list.length);
    } catch { setComplaints([]); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

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
    <DashboardLayout title="Complaints Management" subtitle="Manage and resolve user issues">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Complaints', value: stats.total,    color: 'text-primary-700' },
          { label: 'Open / In Progress', value: stats.open,  color: 'text-red-600' },
          { label: 'Resolved',           value: stats.resolved, color: 'text-emerald-600' },
          { label: 'Closed',             value: stats.closed,   color: 'text-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-card">
            <p className="text-xs font-600 text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-800 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <SearchFilter searchValue={search} onSearch={v => { setSearch(v); }}
            placeholder="Search by customer, subject, ticket ID..."
            filterOptions={[
              { value: 'Open', label: 'Open' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Closed', label: 'Closed' },
            ]}
            filterValue={statusFilter} onFilter={setFilter} filterLabel="Status"
            rightSlot={<button className="btn-secondary" onClick={load}><RefreshCw size={14} /></button>}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Ticket', 'Customer', 'Category', 'Subject', 'Priority', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-700 text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" /></td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">No complaints found</td></tr>
              ) : complaints.map((c, i) => {
                const customer = c.customer ?? {};
                return (
                  <tr key={c._id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 ? 'bg-slate-50/20' : ''}`}>
                    <td className="px-5 py-4"><span className="text-xs font-700 text-primary-700 bg-primary-50 px-2 py-1 rounded-lg">{c.ticketNumber ?? c._id?.slice(-6)}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-700 text-primary-700 text-xs shrink-0">{(customer.name ?? 'C')[0]}</div>
                        <p className="text-sm font-700 text-slate-800">{customer.name ?? '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-600 text-slate-500">{c.category ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700 max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-5 py-4"><span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority] ?? ''}`}>{c.priority ?? '—'}</span></td>
                    <td className="px-5 py-4 text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><span className={`text-xs font-700 px-2.5 py-1 rounded-lg border ${STATUS_COLORS[c.status as Status] ?? ''}`}>{c.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleView(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-700 hover:bg-primary-50 transition-all"><Eye size={15} /></button>
                        <button onClick={() => setDeleteId(c._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={`Complaint — ${selected?.ticketNumber}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs text-slate-400">{selected.category}</p>
                <p className="text-sm font-700 text-slate-700">{selected.subject}</p>
              </div>
              <span className={`text-xs font-700 px-2.5 py-1 rounded-lg border ${STATUS_COLORS[selected.status as Status] ?? ''}`}>{selected.status}</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-700 text-slate-400 uppercase tracking-wider mb-2">Details</p>
              <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
            </div>
            <div>
              <label className="form-label">Internal Admin Notes</label>
              <div className="flex gap-2">
                <textarea rows={2} className="input-field resize-none flex-1" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
                <button onClick={handleSaveNote} disabled={saving} className="btn-primary shrink-0">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => handleStatusUpdate(selected._id, 'In Progress')} disabled={selected.status === 'In Progress' || selected.status === 'Resolved'} className="btn-primary flex-1 justify-center text-sm disabled:opacity-40">
                Investigate
              </button>
              <button onClick={() => handleStatusUpdate(selected._id, 'Resolved')} disabled={selected.status === 'Resolved'} className="flex-1 text-sm py-2 rounded-xl font-700 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40">
                Mark Resolved
              </button>
              <button onClick={() => handleStatusUpdate(selected._id, 'Closed')} disabled={selected.status === 'Closed'} className="btn-danger px-4 text-sm disabled:opacity-40">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Complaint" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto"><AlertTriangle size={26} className="text-red-500" /></div>
          <p className="text-sm font-700 text-slate-800">Delete this complaint ticket?</p>
          <div className="flex gap-3">
            <button className="btn-danger flex-1 justify-center" onClick={handleDelete}>Delete</button>
            <button className="btn-secondary flex-1 justify-center" onClick={() => setDeleteId(null)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
