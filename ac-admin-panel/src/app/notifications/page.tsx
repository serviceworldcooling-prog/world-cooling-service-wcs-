'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { MOCK_NOTIFICATIONS, Notification } from '@/lib/mockData';
import {
  Bell, Plus, Send, Pencil, Trash2, Eye,
  Users, Wrench, Megaphone, AlertTriangle,
  CreditCard, CheckCircle2, Clock, FileText, Sparkles
} from 'lucide-react';

const TYPE_ICON: Record<string, React.ReactNode> = {
  booking:   <Bell size={16} className="text-teal-700" />,
  offer:     <Megaphone size={16} className="text-amber-600" />,
  payment:   <CreditCard size={16} className="text-emerald-600" />,
  system:    <AlertTriangle size={16} className="text-indigo-600" />,
  emergency: <AlertTriangle size={16} className="text-rose-600" />,
};

const TYPE_BG: Record<string, string> = {
  booking:   'bg-teal-50 border border-teal-100',
  offer:     'bg-amber-50 border border-amber-100',
  payment:   'bg-emerald-50 border border-emerald-100',
  system:    'bg-indigo-50 border border-indigo-100',
  emergency: 'bg-rose-50 border border-rose-100',
};

const AUDIENCE_OPTIONS = [
  { value: 'all',         label: 'All Users' },
  { value: 'customers',   label: 'Customers Only' },
  { value: 'technicians', label: 'Technicians Only' },
];

export default function NotificationsPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);

  const sent      = MOCK_NOTIFICATIONS.filter(n => n.status === 'sent').length;
  const scheduled = MOCK_NOTIFICATIONS.filter(n => n.status === 'scheduled').length;
  const drafts    = MOCK_NOTIFICATIONS.filter(n => n.status === 'draft').length;
  const totalSent = MOCK_NOTIFICATIONS.filter(n => n.status === 'sent').reduce((s, n) => s + n.sentCount, 0);

  return (
    <DashboardLayout title="Broadcast Notifications" subtitle="Send and manage mobile push notifications to customer and technician apps">

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Sent',  value: totalSent.toLocaleString('en-IN'), color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Campaigns',   value: sent,                                color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Scheduled',   value: scheduled,                           color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Drafts',      value: drafts,                              color: 'text-slate-500',   bg: 'bg-slate-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/70 shadow-card min-w-0">
            <p className="text-[10px] sm:text-xs font-600 text-slate-500 truncate mb-0.5 sm:mb-1">{label}</p>
            <p className={`text-lg sm:text-2xl font-800 leading-tight ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar Header / Compose Button ── */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h2 className="text-xs sm:text-sm font-800 text-slate-900 tracking-tight">Recent Push Campaigns</h2>
        <button 
          className="btn-primary py-2 px-3.5 text-xs font-700 rounded-xl gap-1.5 shadow-sm"
          onClick={() => setComposeOpen(true)}
        >
          <Plus size={15} /> Compose Notification
        </button>
      </div>

      {/* ── Notification Campaigns List Container (Touched Left & Right on Mobile) ── */}
      <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-white border-y sm:border border-slate-200/70 shadow-card overflow-hidden divide-y divide-slate-100">
        {MOCK_NOTIFICATIONS.map((n) => {
          const readPct = n.sentCount > 0 ? Math.round((n.readCount / n.sentCount) * 100) : 0;
          return (
            <div key={n.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-all">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                
                {/* Header line on mobile: Type Icon + Title + Status */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${TYPE_BG[n.type]} flex items-center justify-center shrink-0`}>
                    {TYPE_ICON[n.type]}
                  </div>

                  <div className="flex-1 sm:hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-800 text-slate-900 leading-snug">{n.title}</p>
                      <Badge
                        variant={n.status === 'sent' ? 'sent' : n.status === 'scheduled' ? 'scheduled' : 'draft'}
                        label={n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                        dot
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="hidden sm:flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-800 text-slate-900">{n.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={n.status === 'sent' ? 'sent' : n.status === 'scheduled' ? 'scheduled' : 'draft'}
                        label={n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                        dot
                      />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 mb-2.5 sm:mb-3 leading-relaxed">{n.body}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-400">
                    <div className="flex items-center gap-1 font-600 text-slate-600">
                      <Users size={12} className="text-teal-700" />
                      <span className="capitalize">{n.targetAudience}</span>
                    </div>
                    {n.sentAt && (
                      <div className="flex items-center gap-1 font-500">
                        <Clock size={12} />
                        <span>{n.sentAt}</span>
                      </div>
                    )}
                    {n.sentCount > 0 && (
                      <div className="flex items-center gap-2 font-600 text-slate-500">
                        <span>{n.sentCount.toLocaleString('en-IN')} sent</span>
                        <span>•</span>
                        <span>{n.readCount.toLocaleString('en-IN')} read</span>
                      </div>
                    )}
                  </div>

                  {/* Read rate bar */}
                  {n.sentCount > 0 && (
                    <div className="mt-2.5 sm:mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Open Rate</span>
                        <span className="font-800 text-slate-700">{readPct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${readPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-row sm:flex-col gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end shrink-0">
                  <button
                    onClick={() => { setSelected(n); setViewOpen(true); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-all"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  {n.status === 'draft' && (
                    <button 
                      className="w-8 h-8 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                      title="Send Campaign"
                    >
                      <Send size={14} />
                    </button>
                  )}
                  <button 
                    className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-all"
                    title="Edit Campaign"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    className="w-8 h-8 rounded-xl flex items-center justify-center border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all"
                    title="Delete Campaign"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Compose Notification Modal ── */}
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Compose Notification" size="md">
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Notification Title *</label>
            <input type="text" placeholder="e.g. Summer Servicing 20% Off" className="input-field text-xs" />
          </div>
          <div>
            <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Message Body *</label>
            <textarea rows={3} placeholder="Write your announcement or promotional push message here…" className="input-field text-xs resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Notification Type *</label>
              <select className="input-field text-xs">
                {['booking', 'offer', 'payment', 'system', 'emergency'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Target Audience *</label>
              <select className="input-field text-xs">
                {AUDIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-800 text-slate-500 uppercase tracking-wider mb-1.5">Schedule (optional)</label>
            <input type="datetime-local" className="input-field text-xs" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button className="btn-primary flex-1 justify-center py-2.5 text-xs rounded-xl gap-1.5">
              <Send size={14} /> Send Now
            </button>
            <button className="btn-secondary flex-1 justify-center py-2.5 text-xs rounded-xl gap-1.5">
              <Clock size={14} /> Schedule
            </button>
            <button className="btn-secondary justify-center py-2.5 px-4 text-xs rounded-xl gap-1.5">
              <FileText size={14} /> Draft
            </button>
          </div>
        </div>
      </Modal>

      {/* ── View Notification Details Modal ── */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title="Notification Details" size="md">
        {selected && (
          <div className="space-y-4 pt-1">
            <div className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl ${TYPE_BG[selected.type]}`}>
              <div className="mt-0.5">{TYPE_ICON[selected.type]}</div>
              <div>
                <p className="text-xs sm:text-sm font-800 text-slate-900">{selected.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-500">{selected.body}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Status',       value: selected.status },
                { label: 'Audience',     value: selected.targetAudience },
                { label: 'Sent At',      value: selected.sentAt || '—' },
                { label: 'Sent Count',   value: selected.sentCount.toLocaleString('en-IN') },
                { label: 'Read Count',   value: selected.readCount.toLocaleString('en-IN') },
                { label: 'Open Rate',    value: selected.sentCount > 0 ? `${Math.round((selected.readCount / selected.sentCount) * 100)}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-700 text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-xs font-800 text-slate-800 mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button className="btn-secondary py-2 px-5 text-xs rounded-xl" onClick={() => setViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
